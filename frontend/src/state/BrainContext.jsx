import React, { createContext, useState } from 'react'

export const BrainContext =createContext()

export const BrainProvider = ( { children }) => {

    const [memories, setMemories] = useState([])
    const [searchResults, setSearchResults] = useState([])
    const [isFetching, setIsFetching] = useState(false)
    const [brainError, setBrainError] = useState(null)
    const [clusters, setClusters] = useState([]);

    const value = {memories ,setMemories ,searchResults ,setSearchResults , clusters, setClusters, isFetching ,setIsFetching ,brainError ,setBrainError };

  return (
    <BrainContext.Provider value={value}>
        {children}
    </BrainContext.Provider>
    )
}

