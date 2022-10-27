import React from 'react'
import {render, fireEvent, cleanup} from '@testing-library/react'
import ParentTestHook from "../../../../../src/components/shared/TestHook/ParentTestHook";
import TestHook from "../../../../../src/components/shared/TestHook/TestHook";

afterEach(cleanup)

it('text in state is changed when button clicked', () => {
    const {getByText} = render(<TestHook/>)

    expect(getByText(/Initial/i).textContent).toBe("Initial State");

    fireEvent.click(getByText("State Change Button"))

    expect(getByText(/Initial/i).textContent).toBe("Initial State Changed")
})

it('button click changes props', () => {
    const {getByText} = render(<ParentTestHook/>)

    expect(getByText(/Moe/i).textContent).toBe("Moe")

    fireEvent.click(getByText("Change Name"))

    expect(getByText(/Steve/i).textContent).toBe("Steve")
})