const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio');
const NotationSyncService = require('./notationSyncService.js');

//how to create dynamically?
const channel = 'L1';

const app = feathers();
app.configure(socketio());
app.use('syncNotations', new NotationSyncService());

// check if the connection is from admin(via open or create exercise), then create a channel
// this channel is to be identified by student via invitation link
app.on('connection', conn => app.channel(channel).join(conn));

app.publish(data => app.channel(channel));
const PORT = process.env.PORT || 3030;
app.listen(PORT).on('listening', () => console.log(`server running on port ${PORT}`));


