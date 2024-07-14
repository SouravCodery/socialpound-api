export interface SoftDeleteInterface {
  isDeleted: boolean;
  deletedAt: Date | null;

  softDelete: () => Promise<this>;
}
