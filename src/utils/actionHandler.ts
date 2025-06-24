import { directive, Directive, DirectiveParameters } from 'lit/directive.js';
import { fireEvent } from './fireEvent';

export interface ActionHandlerOptions {
  hasHold?: boolean;
  hasDoubleClick?: boolean;
}

export interface ActionHandlerEvent extends Event {
  detail: { action: 'tap' | 'hold' | 'double_tap' };
}

class ActionHandler extends Directive {
  private holdTimeout?: number;
  private dblTimeout?: number;
  private held = false;
  private options?: ActionHandlerOptions;

  render (options?: ActionHandlerOptions) {
    this.options = options;
    return {};
  }

  update (part: DirectiveParameters<this>[0], [options]: DirectiveParameters<this>) {
    const element = part.element as HTMLElement & { __actionHandlerAdded?: boolean };

    if (!element.__actionHandlerAdded) {
      element.addEventListener('click', this.handleClick);
      element.addEventListener('mousedown', this.handleHoldStart);
      element.addEventListener('touchstart', this.handleHoldStart);
      element.addEventListener('mouseup', this.handleHoldEnd);
      element.addEventListener('touchend', this.handleHoldEnd);
      element.__actionHandlerAdded = true;
    }

    this.options = options;
    return {};
  }

  private handleHoldStart = () => {
    if (!this.options?.hasHold) {
      return;
    }
    clearTimeout(this.holdTimeout);
    this.held = false;
    this.holdTimeout = window.setTimeout(() => {
      this.held = true;
      fireEvent(window, 'hass-action', { action: 'hold' });
    }, 500);
  };

  private handleHoldEnd = () => {
    clearTimeout(this.holdTimeout);
  };

  private handleClick = (ev: Event) => {
    if (this.held) {
      this.held = false;
      return;
    }

    const target = ev.currentTarget as HTMLElement;

    if (this.options?.hasDoubleClick) {
      if (this.dblTimeout) {
        clearTimeout(this.dblTimeout);
        this.dblTimeout = undefined;
        fireEvent(target, 'hass-action', { action: 'double_tap' });
      } else {
        this.dblTimeout = window.setTimeout(() => {
          fireEvent(target, 'hass-action', { action: 'tap' });
          this.dblTimeout = undefined;
        }, 250);
      }
    } else {
      fireEvent(target, 'hass-action', { action: 'tap' });
    }
  };
}

export const actionHandler = directive(ActionHandler);

export type { ActionHandlerEvent };
