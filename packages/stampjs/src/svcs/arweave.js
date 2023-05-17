import { arGql } from 'ar-gql'

const { all } = arGql(gateway('graphql'))

export const query = ({ query, variables }) => all(query, variables)

function gateway(path) {
  return `https://arweave.net/${path}`
}