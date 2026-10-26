# Extraction Plan

## First module: Notifications

Notifications is the best first extraction because it has a small responsibility, a simple data store, and already communicates through the `order.placed` event instead of a direct orders dependency.

## Five Steps

1. **Make the boundary real**  
   Keep `send` and `sent` as the public API, keep the outbox repository private, and enforce module boundaries so other modules cannot access notification internals.

2. **Move the data**  
   Move notification storage and outbox data to a dedicated database owned by the Notifications service, preserving existing records and ensuring data consistency.

3. **Put a seam in front**  
   Define a clear contract for the `order.placed` event and notification API. Introduce an interface or adapter so the shop communicates through the contract rather than depending on the internal implementation.

4. **Deploy it separately**  
   Run Notifications as an independent service, publish events through a durable broker, and verify message delivery, retries, and failure handling.

5. **Stop**  
   Remove the old in-process Notifications module and local wiring once the new service is verified, then monitor the standalone service and its message delivery.