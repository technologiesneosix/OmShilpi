import { InventoryService } from '../../src/services/inventory.service';

describe('Inventory Unit Tests', () => {
  it('should compute IN_STOCK when quantity > lowStockThreshold', () => {
    const state = InventoryService.computeAvailability(20, 5);
    expect(state).toBe('IN_STOCK');
  });

  it('should compute LOW_STOCK when quantity <= lowStockThreshold and quantity > 0', () => {
    const state = InventoryService.computeAvailability(4, 5);
    expect(state).toBe('LOW_STOCK');
  });

  it('should compute OUT_OF_STOCK when quantity <= 0', () => {
    const state = InventoryService.computeAvailability(0, 5);
    expect(state).toBe('OUT_OF_STOCK');
  });
});
