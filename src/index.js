const { Client, GatewayIntentBits } = require('discord.js');
const { prefix, token } = require("../config/config.json");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const play = require('play-dl');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

const audioPlayer = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause,
  },
});

const queue = new Map();

client.once('ready', () => {
  console.log('Ready!');
});

client.once('reconnecting', () => {
  console.log('Reconnecting!');
});

client.once('disconnect', () => {
  console.log('Disconnect!');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  console.log(`Content:: ${message.content}`);

  let serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}playlist`)) {
    executePlaylist(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}next`)) {
    playNextSong(message, serverQueue);
    return;
  }else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue, audioPlayer);
    return;
  } else if (message.content.startsWith(`${prefix}pause`)) {
    pause(message, serverQueue, audioPlayer);
    return;
  } else if (message.content.startsWith(`${prefix}resume`)) {
    resumeSong(message, serverQueue, audioPlayer);
    return;
  } else {
    message.channel.send('You need to enter a valid command!');
  }
});

async function execute(message, serverQueue) {
  const args = message.content.split(' ');

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send('You need to be in a voice channel to play music!');

  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send('I need the permissions to join and speak in your voice channel!');
  }
  if (message.content.includes("playlist")) {
    executePlaylist(message, voiceChannel, serverQueue, message.content.split('!play')[1].trim());
    return;
  }

  let yt_info = await play.search(message.content.split('play')[1], {
    limit: 1,
  });

  let stream = await play.stream(yt_info[0].url)

  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };

    queueConstruct.songs.push(stream); // Enqueue the song object
    queue.set(message.guild.id, queueConstruct);

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      connection.subscribe(audioPlayer);

      queueConstruct.connection = connection;
      playSong(message.guild, queueConstruct);

    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err.message || 'An error occurred while joining the voice channel.');
    }
  } else {
    serverQueue.songs.push(stream); // Enqueue the song object
    playSong(message.guild, serverQueue, audioPlayer);
    return message.channel.send(`${yt_info[0].title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send('You have to be in a voice channel to stop the music!');
  if (!serverQueue)
    return message.channel.send('There is no song that I could skip!');
  serverQueue.connection.destroy();
}

function pause(message, serverQueue, audioPlayer) {
  if (!message.member.voice.channel)
    return message.channel.send('You have to be in a voice channel to stop the music!');

  if (!serverQueue)
    return message.channel.send('There is no song that I could pause!');
  audioPlayer.pause();
}

function resumeSong(message, serverQueue, audioPlayer) {
  if (!message.member.voice.channel)
    return message.channel.send('You have to be in a voice channel to stop the music!');

  if (!serverQueue)
    return message.channel.send('There is no song that I could resume!');

  audioPlayer.unpause();
}

function stop(message, serverQueue, audioPlayer) {
  if (!message.member.voice.channel)
    return message.channel.send('You have to be in a voice channel to stop the music!');

  if (!serverQueue)
    return message.channel.send('There is no song that I could stop!');
  serverQueue.songs = [];
  audioPlayer.stop();
}

function playSong(guild, queueConstruct, audioPlayer) {
  const serverQueue = queue.get(guild.id);

  if (!serverQueue) {
    return;
  }
  const songInfo = queueConstruct.songs[0];
  if (!songInfo) {
    console.log('No song in the queue.');
    return;
  }

  const audioResource = createAudioResource(songInfo.stream, {
    inputType: songInfo.type,
    volume: 0.5,
  });

  audioPlayer.on('error', (error) => {
    console.error('Audio Player Error:', error);
  });
  audioPlayer.play(audioResource);

  // Set up an event listener for when the audio player's state changes
  audioPlayer.once('stateChange', (oldState, newState) => {
    console.log("oldState", oldState);
    console.log("newState", newState);
    if (newState.status === 'idle') {
      console.log('Finished playing:', songInfo.title);
      playNextSong(guild, serverQueue);
    }
  });

  console.log('Playing:', songInfo.title);
}


async function executePlaylist(message, voiceChannel, serverQueue, playlistURL) {
  try {
    const playlistInfo = await play.playlist_info(playlistURL);
    const playlistSongs = playlistInfo.videos;

    if (!serverQueue) {
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };
      queue.set(message.guild.id, queueConstruct);
      serverQueue = queue.get(message.guild.id);
    }

    for (const song of playlistSongs) {
      let stream = await play.stream(song.url);
      enqueueSong(message, voiceChannel, serverQueue, stream, song.title);
    }

    message.channel.send(`Added ${playlistSongs.length} songs from the playlist to the queue.`);

    // Start playback if not already playing
    if (!serverQueue.playing) {
      playNextSong(message.guild, serverQueue);
    }

    playQueue(message, serverQueue, audioPlayer, voiceChannel);
  } catch (error) {
    console.error(error);
    message.channel.send('An error occurred while processing the playlist.');
  }
}



function enqueueSong(message, voiceChannel, serverQueue, stream, title) {
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };
    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push({ stream, title: title });

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      connection.subscribe(audioPlayer);
      serverQueue.connection = connection;
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err.message || 'An error occurred while joining the voice channel.');
    }
  } else {
    serverQueue.songs.push({ stream, title: title });
  }
}

async function playQueue(message, serverQueue, audioPlayer, voiceChannel) {
  if (!serverQueue) {
    return;
  }
  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    connection.subscribe(audioPlayer);
    serverQueue.connection = connection;
  } catch (err) {
    console.log(err);
    queue.delete(guiId);
    return message.channel.send(err.message || 'An error occurred while joining the voice channel.');
  }

  let song = serverQueue.songs[0];
  if (!song) {
    console.log('No song in the queue.');
    return;
  }
  // const audioStream = ytdl(songInfo.url, { filter: "audioonly", format: "opus"});
  // const audioResource = createAudioResource(song, {
  //   inputType: 'url', filter: "audioonly", volume: 0.5
  // });

    const audioResource = createAudioResource(song.stream.stream, {
      inputType: song.stream.type, volume:0.5
  })
  audioPlayer.on('error', (error) => {
    console.error('Audio Player Error:', error);
  });
  audioPlayer.play(audioResource);
  message.channel.send(`Playing ${song.title}`);
  serverQueue.connection.subscribe(audioPlayer);
  audioPlayer.on('stateChange', (oldState, newState) => 
  {
    console.log("oldState", oldState.status);
    console.log("newState", newState.status);
      if (newState.status === 'idle') {
        playNextSong(message, serverQueue);
      }
  });
  console.log('Playing:', song);
}


async function playNextSong(message, serverQueue) {
  if (!serverQueue.songs.length) {
    console.log('Playlist finished');
    message.channel.send(`Playlist finished`);
    return;
  }
  serverQueue.songs.shift();
  const songInfo = serverQueue.songs[0];
  const audioResource = createAudioResource(songInfo.stream.stream, {
    inputType: songInfo.stream.type,
    volume: 0.5,
  });

  serverQueue.connection.subscribe(audioPlayer); // Subscribe before playing
  audioPlayer.play(audioResource);
  
  message.channel.send(`Playing ${songInfo.title}`);
  // // Set up an event listener for when the current song ends
  // audioPlayer.once('stateChange', (oldState, newState) => {
  //   if (newState.status === 'idle') {
  //     console.log('Finished playing:', songInfo.title);
  //     playNextSong(guild, serverQueue);
  //   }
  // });
}




client.login(token);