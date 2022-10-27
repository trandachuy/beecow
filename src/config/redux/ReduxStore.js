import {configureStore} from 'redux-starter-kit';

import rootReducer from './Reducers';

function configureAppStore(preloadedState) {
    const store = configureStore({
        reducer: rootReducer,
        preloadedState,
        // middleware: [...getDefaultMiddleware()]
        middleware: []
    });

    if (process.env.NODE_ENV !== 'production' && module.hot) {
        module.hot.accept('./Reducers', () => store.replaceReducer(rootReducer))
    }
    return store;
}

const store = configureAppStore();

export default store;
