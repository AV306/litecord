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
let messageLimit = 20;
let lastMessageId;

//let knownUsers = {};

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

/*async function getUser( userId )
{

}*/

async function loadMainPage()
{
	setStatus( "Loading..." );
	await getServers();
	await getChannels();
	//await getMessages();
}

function reloadMainPage()
{
	setStatus( "Reloading" );
	if ( channelSelector.value ) getMessages();
	else if ( guildSelector.value ) getChannels();
	else getServers();
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

		loadMainPage();
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
		guildSelector.add( createGuildOption( guild ) );
	}
	setStatus( "Done fetching servers" );
}

function createGuildOption( guild )
{
	let guildOption = document.createElement( "option" );
	guildOption.value = guild.id;
	guildOption.innerText = guild.name;
	return guildOption;
}

async function getChannels()
{
	let url;
	if ( guildSelector.value === "dms" ) url = `${apiBase}/users/@me/channels`;
	else url = `${apiBase}/guilds/${guildSelector.value}/channels`;

	setStatus( `Fetching channels for server id ${guildSelector.value}` );

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
			let group = createChannelGroup( channel.name );
			channelSelector.appendChild( group );
			mostRecentChannelGroup = group;
		}
		else mostRecentChannelGroup.appendChild( createChannelOption( channel ) );
	}

	setStatus( "Done fetching channels" );
}

function createChannelGroup( name )
{
	let group = document.createElement( "optgroup" );
	group.label = name;
	return group;	
}

function createChannelOption( channel )
{
	let channelOption = document.createElement( "option" );
	channelOption.value = channel.id;

	// Infer DM or regular channel by presence of `recipients` field
	if ( channel.recipients )
	{
		for ( let user of channel.recipients )
			channelOption.innerText += `${user.username}, `;
	}
	else channelOption.innerText = `${channel.type === 2 ? "(Voice) " : ""}${channel.name}`;

	return channelOption;
}

async function getMessages()
{
	let url = `${apiBase}/channels/${channelSelector.value}/messages?limit=${messageLimit}`;
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

async function getMessage( messageId )
{
	let url = `${apiBase}/channels/${channelSelector.value}/messages/${messageId}`;
	//if ( lastMessageId ) url += `&before=${lastMessageId}`;

	//setStatus( `Fetching ${messageLimit} messages for channel id ${channelSelector.value}` );
	let res = await fetch( url, { "headers": headers } );

	if ( !res.ok )
	{
		setStatus( `Could not fetch message id ${messageId} (error ${res.status})` );
		return;
	}

	return await res.json();

	//setStatus( "Done fetching messages" );
}

async function getMoreMessages()
{
	let url = `${apiBase}/channels/${channelSelector.value}/messages?limit=${messageLimit}&before=${lastMessageId}`;

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
		// TODO: createMessage()
		messagesPanel.insertBefore( createMessageComponent( message ), messagesPanel.firstChild );
	}

	// Remember the ID of the last message
	lastMessageId = messages[messages.length - 1].id;
}

function createMessageComponent( message )
{
	let m = document.createElement( "div" );
	m.class = "message-entry";
	m.id = message.id;
	
	let dateString = new Date( message.edited_timestamp ?? message.timestamp ).toLocaleString();

	// Attach replied-to message if any
	if ( message.referenced_message )
	{
		let repliedTo = document.createElement( "p" );
		repliedTo.innerHTML = `<sub><strong>${message.referenced_message.author.global_name}:</strong> ${message.referenced_message.content}</sub>`;
		m.appendChild( repliedTo );
	}

	let c = document.createElement( "p" );
	c.innerHTML = `(${dateString}) <strong>${message.author.global_name}:</strong> ${message.content}`;
	m.appendChild( c );

	return m;
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
		friendsPanel.append( createFriendComponent( friend ) );
	}

	setStatus( "Done fetching friends" );
}

function createFriendComponent( friend )
{
	let friendEntry = document.createElement( "p" );
	//alert( Object.getOwnPropertyNames( friend ) );
	//alert( Object.getOwnPropertyNames( friend.user ) );
	if ( friend.user.global_name ) friendEntry.innerHTML = `<strong>${friend.user.global_name}</strong> (${friend.user.username})\t[${friend.user.id}]`;
	else friendEntry.innerText = friend.user.username;

	let openDmButton = document.createElement( "button" );
	//openDmButton.id = friend.user.id;
	openDmButton.innerText = "Open DM";
	openDmButton.onclick = function () { openDm( friend.id ); };

	let profileButton = document.createElement( "button" );
	profileButton.innerText = "View profile";
	profileButton.onclick = function () { getProfile( friend.id ); };

	friendEntry.append( openDmButton );
	friendEntry.append( profileButton );

	return friendEntry;
}

async function openDm( userId )
{
	let res = await fetch( `${apiBase}/users/@me/channels`,
		{
			"headers": headers,
			"method": "POST",
			"body": JSON.stringify( {
				"recipient_id": userId
			} )
		}
	);

	if ( !res.ok )
	{
		setStatus( `Failed to open DM with user id ${userId} (error ${res.status})` );
		return;
	}

	let newChannelObject = await res.json();

	setStatus( `Opened DM with ${newChannelObject.recipients[0].username}` );
}

async function getProfile( id )
{
	setStatus( `Fetching profile for user id ${id}` );
	let res = await fetch( `${apiBase}/users/${id}/profile`, {"headers": headers} );

	if ( !res.ok )
	{
		setStatus( `Failed to fetch profile for user id ${id}` );
		return;
	}

	let profileData = await res.json();

	setStatus( `Fetched profile for user id ${id}` );

	alert( `${profileData.user.global_name} (${profileData.user_profile.pronouns})\n\n${profileData.user_profile.bio}` );
}