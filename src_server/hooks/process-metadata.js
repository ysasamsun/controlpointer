// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        const { data } = context;

        const type = context.data.type || 'metadata';
        const gameId = context.data.gameId || 'unknown!';
        const metadata = context.data.metadata || [];

        // Override the original data (so that people can't submit additional stuff)
        context.data = {
            metadata,
            gameId,
            createdAt: new Date().getTime()
        };

        // Best practise, hooks should always return the context
        return context;
    };
};
