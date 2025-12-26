module.exports = {
  dietApp: {
    input: {
      target: 'http://localhost:3000/api/docs-json',
    },
    output: {
      clean: true,
      mode: 'single',
      target: 'apps/web/src/lib/generated/api.ts',
      schemaType: 'zod',
      client: 'react-query',
      override: {
        mutator: {
          path: 'apps/web/src/lib/api-service.ts',
          name: 'apiService',
        },
        query: { useQuery: true, useInfinite: false, options: false },
        mutation: { useMutation: true, options: false },
      },
    },
  },
};
