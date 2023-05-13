export const query = ({ query, variables }) => {
  return fetch(gateway('graphql'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  }).then(res => res.json())
}