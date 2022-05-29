const cds = require('../_runtime/cds')

const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { makeExecutableSchema } = require('@graphql-tools/schema')

const { generate } = require('./schema')
const { fieldResolver, createRootResolvers } = require('./resolvers')

class GraphQLAdapter extends express.Router {
  constructor(services, options) {
    super()
    const mergedOptions = { ...defaultOptions, ...options }

    const path = mergedOptions.path
    delete mergedOptions.path

    const applicationServices = Object.values(services).filter(service => service instanceof cds.ApplicationService)

    const typeDefs = generate(applicationServices)
    const resolvers = createRootResolvers(applicationServices)

    const schema = makeExecutableSchema({ typeDefs, resolvers })

    this.use(path, graphqlHTTP({ fieldResolver, schema, ...mergedOptions }))
  }
}

const defaultOptions = {
  path: '/graphql'
}

module.exports = GraphQLAdapter
