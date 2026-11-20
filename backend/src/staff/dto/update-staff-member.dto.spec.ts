import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateStaffMemberDto } from './update-staff-member.dto';

describe('UpdateStaffMemberDto', () => {
  it('allows partial updates without requiring name and specialty', async () => {
    const dto = plainToInstance(UpdateStaffMemberDto, { bio: 'Especialista en blackwork.' });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('still validates provided fields', async () => {
    const dto = plainToInstance(UpdateStaffMemberDto, { name: 'A' });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });

  it('rejects unknown properties through the global whitelist contract', async () => {
    const dto = plainToInstance(UpdateStaffMemberDto, { unexpected: true });
    expect(dto).not.toHaveProperty('unexpected');
  });
});
