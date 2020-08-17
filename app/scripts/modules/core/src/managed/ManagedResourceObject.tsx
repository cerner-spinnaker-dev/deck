import React, { memo } from 'react';
import { useSref } from '@uirouter/react';

import { Application } from 'core/application';
import { Icon, IconNames } from '../presentation';
import { IManagedResourceSummary, IManagedEnviromentSummary, IManagedArtifactSummary } from '../domain/IManagedEntity';

import { getKindName } from './ManagedReader';
import { ObjectRow } from './ObjectRow';
import { AnimatingPill, Pill } from './Pill';
import { getResourceName, getArtifactVersionDisplayName } from './displayNames';
import { StatusBubble } from './StatusBubble';
import { viewConfigurationByStatus } from './managedResourceStatusConfig';
import { ManagedResourceStatusPopover } from './ManagedResourceStatusPopover';

export interface IManagedResourceObjectProps {
  application: Application;
  resource: IManagedResourceSummary;
  artifactVersionsByState?: IManagedEnviromentSummary['artifacts'][0]['versions'];
  artifactDetails?: IManagedArtifactSummary;
  depth?: number;
}

const kindIconMap: { [kind: string]: IconNames } = {
  cluster: 'cluster',
  'security-group': 'securityGroup',
  'classic-load-balancer': 'loadBalancer',
  'application-load-balancer': 'loadBalancer',
};

const getIconTypeFromKind = (kind: string) => kindIconMap[getKindName(kind)] ?? 'placeholder';

const getResourceRoutingInfo = (
  resource: IManagedResourceSummary,
): { state: string; params: { [key: string]: string } } | null => {
  const {
    kind,
    moniker: { stack, detail },
    locations: { account },
  } = resource;
  const kindName = getKindName(kind);
  const params = {
    acct: account,
    stack: stack ?? '(none)',
    detail: detail ?? '(none)',
    q: getResourceName(resource),
  };

  switch (kindName) {
    case 'cluster':
      return { state: 'home.applications.application.insight.clusters', params };

    case 'security-group':
      return { state: 'home.applications.application.insight.firewalls', params };

    case 'classic-load-balancer':
    case 'application-load-balancer':
      return { state: 'home.applications.application.insight.loadBalancers', params };
  }

  return null;
};

export const ManagedResourceObject = memo(
  ({ application, resource, artifactVersionsByState, artifactDetails, depth }: IManagedResourceObjectProps) => {
    const { kind } = resource;
    const resourceName = getResourceName(resource);
    const routingInfo = getResourceRoutingInfo(resource) ?? { state: '', params: {} };
    const route = useSref(routingInfo.state, routingInfo.params);

    const current =
      artifactVersionsByState?.current &&
      artifactDetails?.versions.find(({ version }) => version === artifactVersionsByState?.current);
    const deploying =
      artifactVersionsByState?.deploying &&
      artifactDetails?.versions.find(({ version }) => version === artifactVersionsByState?.deploying);

    const currentPill = current && <Pill text={getArtifactVersionDisplayName(current)} />;
    const deployingPill = deploying && (
      <>
        <Icon appearance="neutral" name="caretRight" size="medium" />
        <AnimatingPill text={getArtifactVersionDisplayName(deploying)} />
      </>
    );

    const viewConfig = viewConfigurationByStatus[resource.status];
    const resourceStatus = resource.status !== 'HAPPY' && viewConfig && (
      <ManagedResourceStatusPopover application={application} placement="left" resourceSummary={resource}>
        <StatusBubble appearance={viewConfig.appearance} iconName={viewConfig.iconName} size="small" />
      </ManagedResourceStatusPopover>
    );

    return (
      <ObjectRow
        icon={getIconTypeFromKind(kind)}
        title={route ? <a {...route}>{resourceName}</a> : resourceName}
        depth={depth}
        content={resourceStatus}
        metadata={
          <span className="flex-container-h middle">
            {currentPill}
            {deployingPill}
          </span>
        }
      />
    );
  },
);
