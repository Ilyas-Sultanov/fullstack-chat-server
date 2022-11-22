import { RoleModel } from '../models';

class RolesService {
  async getRoles() {
    const roles = await RoleModel.find().lean();
    return roles;
  }
}

export const rolesService = new RolesService();
