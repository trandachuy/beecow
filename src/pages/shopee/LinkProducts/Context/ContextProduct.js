import React from 'react'
const initState={
    productList:[]

}
const context=React.createContext(initState)
const action={
    addNewProduct:(product)
}