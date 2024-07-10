const apiBase = "https://discord.com/api";
let userDataBar = document.getElementById( "user-info" );
let statusBar = document.getElementById( "status" );
let token;
let headers;

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
	token = document.getElementById( "token-input" ).value;

	headers = {
		"Authorization": token,
		"Content-Type": "application/json"
	};
	
	// Try GETting current user endpoint
	// If status is 401, then token is invalid
	response = await fetch( `${apiBase}/users/@me`, { "headers": headers } );

	if ( response.ok )
	{
		// Get user data
		let userData = await response.json();
		//userDataBar.innerText = `${userData.display_name} (${userData.username})`;
		userDataBar.innerText = userData.username;
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
	setStatus( "Fetchiing servers, please wait..." );
	let res = await fetch( `${apiBase}/users/@me/guilds`, { "headers": headers } );

	if ( !res.ok )
	{
		setStatus( `Could not fetch servers (error ${res.status})` );
		return;
	}

	let guildsData = await res.json();

	let guildsSelector = document.getElementById( "guild-select" );
	for ( let guild of guildsData )
	{
		let guildOption = document.createElement( "option" );
		guildOption.value = guild.id;
		guildOption.innerText = guild.name;
		//guildOption.id = guild.id;
		guildsSelector.add( guildOption );
	}
	setStatus( "Done fetching servers" );
}

async function getChannels( selectObject )
{
	setStatus( `Fetching channels for server id ${selectObject.value}` );
	let res = await fetch( `${apiBase}/guilds/${selectObject.value}/channels`, { "headers": headers } );

	if ( !res.ok )
	{
		setStatus( `Could not fetch channels (error ${res.status})` );
		return;
	}

	let channels = await res.json();

	let channelSelector = document.getElementById( "channel-select" );
	channelSelector.innerHTML = null;
	for ( let channel of channels )
	{
		let channelOption = document.createElement( "option" );
		channelOption.value = channel.id;
		channelOption.innerText = channel.name;
		//channelOption.id = 
		channelSelector.add( channelOption );
	}

	setStatus( "Done fetching channels" );
}

async function getMessages( selectObject )
{
	setStatus( `Fetching messages for channel id ${selectObject.value}` );
	let res = await fetch( `${apiBase}/channels/${selectObject.value}/messages?limit=30`, { "headers": headers } );

	if ( !res.ok )
	{
		setStatus( `Could not fetch messages (error ${res.status})` );
		return;
	}

	let messages = await res.json();
	let messagesPanel = document.getElementById( "messages-panel" );

	for ( let message of messages )
	{
		let m = document.createElement( "p" );
		m.innerText = message.content;
		messagesPanel.appendChild( m );
	}

	setStatus( "Done fetching messages" );
}