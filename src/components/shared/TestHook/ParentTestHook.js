import React, {useState} from 'react';
import TestHook from "./TestHook";

const ParentTestHook = () => {
    const [state, setState] = useState("Some Text")
    const [name, setName] = useState("Moe")

    const changeName = () => {
        setName("Steve")
    }

    return (
        <div className="App">
            <h1> Counter </h1>
            <h1> Basic Hook useState </h1>
            <TestHook name={name} changeName={changeName}/>
        </div>
    )
}

export default ParentTestHook;