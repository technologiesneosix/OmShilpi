import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { CreateAddressInput, UpdateAddressInput } from '../validators/address.validator';

export class AddressService {
  /**
   * Creates a new address for a customer.
   */
  static async createAddress(userId: string, input: CreateAddressInput) {
    const existingCount = await prisma.address.count({
      where: { userId },
    });

    const isFirstAddress = existingCount === 0;
    const shouldBeDefault = isFirstAddress || Boolean(input.isDefault);

    return prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId,
          fullName: input.fullName,
          phone: input.phone,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 || null,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country || 'India',
          isDefault: shouldBeDefault,
        },
      });
    });
  }

  /**
   * Retrieves all saved addresses for a customer.
   */
  static async getUserAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Retrieves a specific address by ID with ownership verification.
   */
  static async getAddressById(userId: string, addressId: string) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw ApiError.notFound(`Address with ID '${addressId}' not found`, 'ADDRESS_NOT_FOUND');
    }

    return address;
  }

  /**
   * Updates an existing customer address.
   */
  static async updateAddress(userId: string, addressId: string, input: UpdateAddressInput) {
    await this.getAddressById(userId, addressId);

    return prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...(input.fullName !== undefined && { fullName: input.fullName }),
          ...(input.phone !== undefined && { phone: input.phone }),
          ...(input.addressLine1 !== undefined && { addressLine1: input.addressLine1 }),
          ...(input.addressLine2 !== undefined && { addressLine2: input.addressLine2 || null }),
          ...(input.city !== undefined && { city: input.city }),
          ...(input.state !== undefined && { state: input.state }),
          ...(input.postalCode !== undefined && { postalCode: input.postalCode }),
          ...(input.country !== undefined && { country: input.country }),
          ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
        },
      });
    });
  }

  /**
   * Deletes a customer address.
   */
  static async deleteAddress(userId: string, addressId: string) {
    const targetAddress = await this.getAddressById(userId, addressId);

    return prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id: addressId },
      });

      if (targetAddress.isDefault) {
        const remaining = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (remaining) {
          await tx.address.update({
            where: { id: remaining.id },
            data: { isDefault: true },
          });
        }
      }

      return { message: 'Address deleted successfully' };
    });
  }

  /**
   * Sets an address as the default address for a customer.
   */
  static async setDefaultAddress(userId: string, addressId: string) {
    await this.getAddressById(userId, addressId);

    return prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      return tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });
  }
}
