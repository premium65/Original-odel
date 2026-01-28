import { z } from 'zod';
import { insertAdSchema, insertWithdrawalSchema, ads, withdrawals, users, deposits } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// Admin schemas
export const restrictUserSchema = z.object({
  adsLimit: z.number().int(),
  deposit: z.string(),
  commission: z.string(),
  pendingAmount: z.string().optional(),
});

export const manualDepositSchema = z.object({
  amount: z.string(),
});

export const updateUserSchema = z.object({
  username: z.string().optional(),
  mobileNumber: z.string().optional(),
  password: z.string().optional(),
});

export const updateBankDetailsSchema = z.object({
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolderName: z.string().optional(),
  branchName: z.string().optional(),
});

export const api = {
  ads: {
    list: {
      method: 'GET' as const,
      path: '/api/ads',
      responses: {
        200: z.array(z.custom<typeof ads.$inferSelect>()),
      },
    },
    click: {
      method: 'POST' as const,
      path: '/api/ads/:id/click',
      responses: {
        200: z.object({ success: z.boolean(), earnings: z.string() }),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/ads',
      input: insertAdSchema,
      responses: {
        201: z.custom<typeof ads.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/ads/:id',
      input: insertAdSchema.partial(),
      responses: {
        200: z.custom<typeof ads.$inferSelect>(),
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/ads/:id',
      responses: {
        204: z.void(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  withdrawals: {
    list: { // For admin or user history
      method: 'GET' as const,
      path: '/api/withdrawals',
      responses: {
        200: z.array(z.custom<typeof withdrawals.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/withdrawals',
      input: insertWithdrawalSchema,
      responses: {
        201: z.custom<typeof withdrawals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    approve: {
      method: 'POST' as const,
      path: '/api/admin/withdrawals/:id/approve',
      responses: {
        200: z.custom<typeof withdrawals.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    reject: {
      method: 'POST' as const,
      path: '/api/admin/withdrawals/:id/reject',
      input: z.object({ reason: z.string() }),
      responses: {
        200: z.custom<typeof withdrawals.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  users: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // Admin ops
    list: {
      method: 'GET' as const,
      path: '/api/admin/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
        403: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/admin/users/:id/status',
      input: z.object({ status: z.enum(['pending', 'active', 'frozen']) }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    restrict: {
      method: 'POST' as const,
      path: '/api/admin/users/:id/restrict',
      input: restrictUserSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    unrestrict: {
      method: 'POST' as const,
      path: '/api/admin/users/:id/unrestrict',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    deposit: {
      method: 'POST' as const,
      path: '/api/admin/users/:id/deposit',
      input: manualDepositSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    resetField: {
      method: 'POST' as const,
      path: '/api/admin/users/:id/reset-field',
      input: z.object({ field: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
