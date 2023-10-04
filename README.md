# DiscordMusicBot
Bot to play youtube videos on the voice channel.

## How to run
Install the dependencies
``` 
npm install
```

Once create a bot in the discord website, edit the config/config.json adding your token and run the command below:
``` 
nodemon
```

## Commands
For this bot, the following commands are working and available:

|   Command   | Description                                           |
| ----------- | ------------------------------------------            |
|    play     |   execute a link video or a playlist                  |
|    stop     |   stop the queue or the link video                    |
|    pause    |   pause the link video                                |
|    resume   |   unpause the link video                              |
!    list     |   list all queued links returning position and title  |

## Arguments
The arguments below can be used with the play command

|   Command        | Description                                                  |
| -----------      | ------------------------------------------                   |
|    --p number    |   play the link video using the number position of the queue |
|    --shuffle     |   randomize the playlist queue                               |
