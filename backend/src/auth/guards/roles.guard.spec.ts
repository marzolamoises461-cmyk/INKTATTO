import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  function contextFor(role?: 'user' | 'admin'): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => role ? { user: { id: 1, role } } : {},
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(['admin']) };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows the required admin role', () => {
    expect(guard.canActivate(contextFor('admin'))).toBe(true);
  });

  it('returns 403 for an authenticated user without the required role', () => {
    expect(() => guard.canActivate(contextFor('user'))).toThrow(ForbiddenException);
  });

  it('allows a route without role metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(contextFor('user'))).toBe(true);
  });
});
