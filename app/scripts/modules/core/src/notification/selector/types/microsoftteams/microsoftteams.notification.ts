import { Registry } from 'core/registry';

import { MicrosoftTeamsNotificationType } from './MicrosoftTeamsNotificationType';

Registry.pipeline.registerNotification({
  component: MicrosoftTeamsNotificationType,
  key: 'microsoftteams',
  label: 'Microsoft Teams',
});
