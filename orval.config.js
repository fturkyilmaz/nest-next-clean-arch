module.exports = {
  dietApp: {
    input: {
      target: 'http://localhost:3001/swagger.json',
    },
    output: {
      clean: true,
      mode: 'single',
      target: 'packages/shared/api/generated.ts',
      schemaType: 'zod',
      client: 'react-query',
      override: {
        // mutator: {
        //   path: "packages/shared/api-client/client.ts",
        //   name: 'api',
        // },
        query: { useQuery: true, useInfinite: false, options: false },
        mutation: { useMutation: true, options: false },
      },
    },
  },
};
