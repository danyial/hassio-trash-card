import { fireEvent } from './fireEvent';

import type { HomeAssistant } from './ha';

interface ActionConfig {
  action: 'more-info' | 'navigate' | 'url' | 'call-service' | 'none';
  navigation_path?: string;
  url_path?: string;
  service?: string;
  service_data?: Record<string, unknown>;
}

export const handleAction = (
  node: HTMLElement,
  hass: HomeAssistant,
  entity: string | undefined,
  actionConfig?: ActionConfig
) => {
  if (!actionConfig || actionConfig.action === 'none') {
    return;
  }

  switch (actionConfig.action) {
    case 'more-info':
      if (entity) {
        fireEvent(node, 'hass-more-info', { entityId: entity });
      }
      break;
    case 'navigate':
      if (actionConfig.navigation_path) {
        // eslint-disable-next-line no-restricted-globals
        window.location.pathname = actionConfig.navigation_path;
      }
      break;
    case 'url':
      if (actionConfig.url_path) {
        window.open(actionConfig.url_path);
      }
      break;
    case 'call-service':
      if (actionConfig.service) {
        const [ domain, service ] = actionConfig.service.split('.');

        hass.callApi<any>('POST', `/api/services/${domain}/${service}`, actionConfig.service_data ?? {}).catch(() => {
          /* Ignore errors */
        });
      }
      break;
    default:
      break;
  }
};

export type { ActionConfig };
