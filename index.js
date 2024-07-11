const apiBase = "https://discord.com/api";

let tokenInput = document.getElementById( "token-input" );
let userDataBar = document.getElementById( "user-info" );
let statusBar = document.getElementById( "litecord-status" );
let guildSelector = document.getElementById( "guild-select" );
let channelSelector = document.getElementById( "channel-select" );
let messagesPanel = document.getElementById( "messages-panel" );
let messageInput = document.getElementById( "message-input" )
let friendsPanel = document.getElementById( "friends-panel" );

let token;
let headers;
let currentUser;
let messageLimit = 30;
let lastMessageId;

document.addEventListener( "keyup", event =>
{
	if ( !event.shiftKey && event.code === 'Enter' )
		switch ( document.activeElement.id )
		{
			case tokenInput.id:
				validateToken();
				break;
			case messageInput.id:
				sendMessage();
				break;
		}
} );
	

/*async function fetchJson( url, headers )
{
	let res = await fetch( url, { "headers": headers } );
	if ( res.ok ) return await res.json();
	else alert( `Error fetching from ${url}: error ${res.status}` );
}*/

function setStatus( text )
{
	statusBar.innerText = text;
}

async function validateToken()
{
	setStatus( "Checking token..." );
	token = tokenInput.value;

	headers = {
		"Authorization": token,
		"Content-Type": "application/json"
	};
	
	// Try GETting current user endpoint
	// If status is 401, then token is invalid
	let response = await fetch( `${apiBase}/users/@me`, { "headers": headers } );

	if ( response.ok )
	{
		// Get user data
		currentUser = await response.json();
		//userDataBar.innerText = `${userData.display_name} (${userData.username})`;
		userDataBar.innerText = currentUser.username;
		setStatus( "Valid token provided!" );

		getServers();
	}
	else
	{
		setStatus( `Invaid token provided (error ${response.status})` );
	}
}

async function getServers()
{
	setStatus( "Fetching servers, please wait..." );
	let res = await fetch( `${apiBase}/users/@me/guilds`, { "headers": headers } );

	if ( !res.ok )
	{
		setStatus( `Could not fetch servers (error ${res.status})` );
		return;
	}

	let guildsData = await res.json();
	//guildSelector.innerHTML = null;
	channelSelector.innerHTML = null;

	for ( let guild of guildsData )
	{
		let guildOption = document.createElement( "option" );
		guildOption.value = guild.id;
		guildOption.innerText = guild.name;
		//guildOption.id = guild.id;
		guildSelector.add( guildOption );
	}
	setStatus( "Done fetching servers" );
}

async function getChannels( selectObject )
{
	let url;
	let isDirectMessages = false;
	if ( selectObject.value === "dms" )
	{
		url = `${apiBase}/users/@me/channels`;
		isDirectMessages = true;
	}
	else url = `${apiBase}/guilds/${selectObject.value}/channels`;

	setStatus( `Fetching channels for server id ${selectObject.value}` );

	let res = await fetch( url, { "headers": headers } );

	if ( !res.ok )
	{
		setStatus( `Could not fetch channels (error ${res.status})` );
		return;
	}

	let channels = await res.json();

	channelSelector.innerHTML = null;
	messagesPanel.innerHTML = null;
	let mostRecentChannelGroup = document.createElement( "optgroup" );
	mostRecentChannelGroup.label = "Uncategorised";
	channelSelector.appendChild( mostRecentChannelGroup );
	for ( let channel of channels )
	{
		if ( channel.type == 4 )
		{
            let channelGroup = document.createElement( "optgroup" );
			channelGroup.label = channel.name;
			channelSelector.appendChild( channelGroup );
			mostRecentChannelGroup = channelGroup;
		}
		else
		{
			let channelOption = document.createElement( "option" );
			channelOption.value = channel.id;
			if ( isDirectMessages )
			{
				for ( let user of channel.recipients )
					channelOption.innerText += `${user.username}, `;
			}
			else channelOption.innerText = channel.name;
				
			mostRecentChannelGroup.appendChild( channelOption );
		}
	}

	setStatus( "Done fetching channels" );
}

async function getMessages()
{
	let url = `${apiBase}/channels/${channelSelector.value}/messages?limit=${messageLimit}`
	//if ( lastMessageId ) url += `&before=${lastMessageId}`;

	setStatus( `Fetching ${messageLimit} messages for channel id ${channelSelector.value}` );
	let res = await fetch( url, { "headers": headers } );

	if ( !res.ok )
	{
		setStatus( `Could not fetch messages (error ${res.status})` );
		return;
	}

	insertMessages( await res.json(), true );

	setStatus( "Done fetching messages" );
}


async function getMoreMessages()
{
	let url = `${apiBase}/channels/${channelSelector.value}/messages?limit=${messageLimit}&before=${lastMessageId}`

	setStatus( `Fetching ${messageLimit} more messages for channel id ${channelSelector.value} before id ${lastMessageId}` );
	let res = await fetch( url, { "headers": headers } );

	if ( !res.ok )
	{
		setStatus( `Could not fetch messages (error ${res.status})` );
		return;
	}

	insertMessages( await res.json(), false );

	setStatus( `Done fetching more messages, last message is now ${lastMessageId}` );
}

function insertMessages( messages, clear )
{
	if ( clear ) messagesPanel.innerHTML = null;

	for ( let message of messages )
	{
		let m = document.createElement( "p" );
		m.classList.add( "message" );
		let dateString = new Date( message.edited_timestamp ?? message.timestamp ).toLocaleString();
		m.innerHTML = `(${dateString}) <strong>${message.author.global_name}:</strong> ${message.content}`;
		messagesPanel.insertBefore( m, messagesPanel.firstChild );
	}

	// Remember the ID of the last message
	lastMessageId = messages[messages.length - 1].id;
}

async function sendMessage()
{
	let currentChannelId = channelSelector.value;
	setStatus( `Sending message ${messageInput.value} to channel id ${currentChannelId}` );

	let res = await fetch(
		`${apiBase}/channels/${currentChannelId}/messages`,
		{
			"headers": headers,
			"method": "POST",
			"body": JSON.stringify(
				{
					"content": messageInput.value
				}
			)
		}
	);

	if ( res.ok )
	{
		setStatus( `Sent message to channel id ${currentChannelId}` );
		getMessages( channelSelector );
		messageInput.value = null;
	}
	else setStatus( `Error sending message (error ${res.status})` );
}

function switchPage( pageId )
{
	for ( let div of document.getElementsByTagName( "div" ) )
	{
		if( div.id.includes( "-page" ) )
		{
			if ( div.id === pageId ) div.classList.remove( "hidden" );
			else div.classList.add( "hidden" );
		}
	}
}

async function getFriends()
{
	setStatus( "Fetching friends of " + currentUser.username );
	//alert( Object.keys( currentUser ) );
	let res = await fetch( `${apiBase}/users/@me/relationships`, { "headers": headers } );

	if ( !res.ok )
	{
		setStatus( `Failed to fetch friends (error ${res.status})` );
		return;
	}

	let friends = await res.json();

	setStatus( `User ${currentUser.username} has ${friends.length} friends` );

	for ( let friend of friends )
	{
		let friendEntry = document.createElement( "p" );
		if ( friend.nickname ) friendEntry.innerHTML = `<strong>${friend.nickname}</strong> (${friend.user.username})`;
		else friendEntry.innerText = friend.user.username;
		friendsPanel.appendChild( friendEntry );
	}

	setStatus( "Done fetching friends" )
}