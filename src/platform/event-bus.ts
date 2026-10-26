/**
 * An in-process event bus. THIS IS A STUB - you finish it.
 *
 * Requirements:
 *   - a handler that throws must not stop the other handlers
 *   - publish returns the number of handlers it reached
 *   - subscribing the same function twice registers it twice (do not dedupe)
 *   - publishing a name nobody listens to is fine and returns 0
 */

/** The events this system publishes. Add to it as you need to. */
export interface DomainEvents {
  "order.placed": { orderId: string; email: string; amountPaise: number };
}

export type EventName = keyof DomainEvents;
export type Handler<K extends EventName> = (payload: DomainEvents[K]) => void;
export type Unsubscribe = () => void;

export interface EventBus {
  publish<K extends EventName>(name: K, payload: DomainEvents[K]): number;
  subscribe<K extends EventName>(name: K, fn: Handler<K>): Unsubscribe;
}

export function createEventBus(): EventBus {
  const handlers = new Map<EventName, Handler<EventName>[]>();

  return {
    publish(name, payload) {
      const registered = handlers.get(name) ?? [];
      for (const handler of registered) {
        try {
          handler(payload);
        } catch {
          // A subscriber must not prevent other subscribers from running.
        }
      }
      return registered.length;
    },

    subscribe(name, fn) {
      const registered = handlers.get(name) ?? [];
      registered.push(fn as Handler<EventName>);
      handlers.set(name, registered);

      return () => {
        const index = registered.indexOf(fn as Handler<EventName>);
        if (index >= 0) registered.splice(index, 1);
      };
    },
  };
}

export const eventBus = createEventBus();
