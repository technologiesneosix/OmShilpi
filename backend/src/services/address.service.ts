import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { CreateAddressInput, UpdateAddressInput } from '../validators/address.validator';

export class AddressService {

  static async createAddress(userId: string, input: CreateAddressInput) {
    const existingCount = await prisma.address.count({
      where: { userId },
    });

    const isFirstAddress = existingCount === 0;
    const shouldBeDefault = isFirstAddress || Boolean(input.isDefault);

    return prisma.$transaction(
      async (tx) => {
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
      },
      { timeout: 15000 }
    );
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
   * Updates an existing customer address with ownership verification.
   */
  static async updateAddress(userId: string, addressId: string, input: UpdateAddressInput) {
    await this.getAddressById(userId, addressId);

    const shouldBeDefault = Boolean(input.isDefault);

    return prisma.$transaction(
      async (tx) => {
        if (shouldBeDefault) {
          await tx.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
          });
        }

        const updateData: any = {};
        if (input.fullName !== undefined) updateData.fullName = input.fullName;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.addressLine1 !== undefined) updateData.addressLine1 = input.addressLine1;
        if (input.addressLine2 !== undefined) updateData.addressLine2 = input.addressLine2;
        if (input.city !== undefined) updateData.city = input.city;
        if (input.state !== undefined) updateData.state = input.state;
        if (input.postalCode !== undefined) updateData.postalCode = input.postalCode;
        if (input.country !== undefined) updateData.country = input.country;
        if (input.isDefault !== undefined) updateData.isDefault = input.isDefault;

        return tx.address.update({
          where: { id: addressId },
          data: updateData,
        });
      },
      { timeout: 15000 }
    );
  }

  static async setDefaultAddress(userId: string, addressId: string) {
    const targetAddress = await this.getAddressById(userId, addressId);

    if (targetAddress.isDefault) {
      return targetAddress;
    }

    return prisma.$transaction(
      async (tx) => {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });

        return tx.address.update({
          where: { id: addressId },
          data: { isDefault: true },
        });
      },
      { timeout: 15000 }
    );
  }

  /**
   * Deletes an address for a customer with ownership verification.
   */
  static async deleteAddress(userId: string, addressId: string) {
    await this.getAddressById(userId, addressId);

    await prisma.address.delete({
      where: { id: addressId },
    });

    return { id: addressId, deleted: true };
  }
}
