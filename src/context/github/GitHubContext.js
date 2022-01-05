import { createContext, useReducer } from 'react'
import githubReducer from './GitHubReducer'

const GithubContext = createContext()

const GITHUB_URL = process.env.REACT_APP_GITHUB_URL
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN

export const GithubProvider = ({ children }) => {
  const initialState = {
    users: [],
    user: [],
    loading: false,
  }

  const [state, dispatch] = useReducer(githubReducer, initialState)

  // Get search results
  const searchUsers = async (text) => {
    setLoading()

    const params = new URLSearchParams({
      q: text,
    })

    // GitHub Personal Auth Tokens keep disappearing
    const authHeader = GITHUB_TOKEN
      ? {
          header: {
            Authorization: GITHUB_TOKEN,
          },
        }
      : {}

    const response = await fetch(
      `${GITHUB_URL}/search/users?${params}`,
      authHeader
    )

    const { items } = await response.json()

    dispatch({
      type: 'GET_USERS',
      payload: items,
    })
  }

  // Get a single user
  const getUser = async (login) => {
    setLoading()

    // GitHub Personal Auth Tokens keep disappearing
    const authHeader = GITHUB_TOKEN
      ? {
          header: {
            Authorization: GITHUB_TOKEN,
          },
        }
      : {}

    const response = await fetch(`${GITHUB_URL}/users/${login}`, authHeader)

    if (response.status == 404) {
      window.location = '/notfound'
    } else {
      const data = await response.json()

      dispatch({
        type: 'GET_USER',
        payload: data,
      })
    }
  }

  // Clear users from state
  const clearUsers = () => {
    dispatch({
      type: 'CLEAR_USERS',
    })
  }

  // Set loading
  const setLoading = () => {
    dispatch({
      type: 'SET_LOADING',
    })
  }

  return (
    <GithubContext.Provider
      value={{
        users: state.users,
        user: state.user,
        loading: state.loading,
        searchUsers,
        getUser,
        clearUsers,
      }}
    >
      {children}
    </GithubContext.Provider>
  )
}

export default GithubContext
