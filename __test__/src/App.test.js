import React from 'react';
import {render, screen} from '@testing-library/react';
import store from "../../src/config/redux/ReduxStore";
import {RecoilRoot} from "recoil";
import App from "../../src/App";
import {Provider} from "react-redux";

test('renders without crashing', () => {
    render(<Provider store={store}>
        <RecoilRoot>
            <App />
        </RecoilRoot>
    </Provider>);
    screen.debug();
});
