/**
 * Plan Configuration Tests
 *
 * Tests plan definitions, credit allocations, and lead limits.
 */

import { describe, it, expect } from 'vitest';
import {
  PLAN_CONFIGS,
  FREEMIUM_PLAN,
  PLAN_CREDITS,
  PLAN_LEAD_LIMITS,
  getPlanConfig,
  isValidPlanId,
} from '@/lib/payment/plans';

describe('plan definitions', () => {
  it('should define three payment plans', () => {
    expect(Object.keys(PLAN_CONFIGS)).toHaveLength(3);
    expect(PLAN_CONFIGS).toHaveProperty('pro');
    expect(PLAN_CONFIGS).toHaveProperty('agencia');
    expect(PLAN_CONFIGS).toHaveProperty('credits50');
  });

  it('should have Pro plan with correct pricing', () => {
    expect(PLAN_CONFIGS.pro.priceBRL).toBe(47);
    expect(PLAN_CONFIGS.pro.effect).toBe('subscription');
    expect(PLAN_CONFIGS.pro.credits).toBe(200);
    expect(PLAN_CONFIGS.pro.leadLimit).toBe(200);
    expect(PLAN_CONFIGS.pro.isRecommended).toBe(true);
  });

  it('should have Agencia plan with correct pricing', () => {
    expect(PLAN_CONFIGS.agencia.priceBRL).toBe(147);
    expect(PLAN_CONFIGS.agencia.effect).toBe('subscription');
    expect(PLAN_CONFIGS.agencia.credits).toBe(1000);
    expect(PLAN_CONFIGS.agencia.leadLimit).toBe(1000);
  });

  it('should have Credits50 plan as credits effect', () => {
    expect(PLAN_CONFIGS.credits50.effect).toBe('credits');
    expect(PLAN_CONFIGS.credits50.credits).toBe(50);
  });

  it('should have freemium defaults', () => {
    expect(FREEMIUM_PLAN.priceBRL).toBe(0);
    expect(FREEMIUM_PLAN.credits).toBe(20);
    expect(FREEMIUM_PLAN.leadLimit).toBe(20);
  });

  it('should map credits correctly', () => {
    expect(PLAN_CREDITS.freemium).toBe(20);
    expect(PLAN_CREDITS.pro).toBe(200);
    expect(PLAN_CREDITS.agencia).toBe(1000);
  });

  it('should map lead limits correctly', () => {
    expect(PLAN_LEAD_LIMITS.freemium).toBe(20);
    expect(PLAN_LEAD_LIMITS.pro).toBe(200);
    expect(PLAN_LEAD_LIMITS.agencia).toBe(1000);
  });

  it('should return plan config by ID', () => {
    const pro = getPlanConfig('pro');
    expect(pro.name).toBe('Pro');
  });

  it('should throw for invalid plan ID', () => {
    expect(() => getPlanConfig('invalid' as any)).toThrow('Invalid plan ID');
  });

  it('should validate plan IDs', () => {
    expect(isValidPlanId('pro')).toBe(true);
    expect(isValidPlanId('agencia')).toBe(true);
    expect(isValidPlanId('credits50')).toBe(true);
    expect(isValidPlanId('invalid')).toBe(false);
  });
});
