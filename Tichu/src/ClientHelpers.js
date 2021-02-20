

const getGameServer = () => {
    var gameServer = `http://${window.location.hostname}`;
    if (window.location.port && window.location.port !== ' ') {
        gameServer += `:${window.location.port}`;
    }
    gameServer += '/';

    return gameServer;
}

export const gameServer = getGameServer();