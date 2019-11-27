function BuildGameRow( gameInfo, bViewingOwnProfile )
{
	gameInfo['name_encoded'] = encodeURIComponent( gameInfo['name'] );
	gameInfo['name_escaped'] = gameInfo['name'].escapeHTML();	//prototype
	gameInfo['persona_name'] = personaName;
	gameInfo['profile_link'] = profileLink;
	gameInfo['link'] = ( \"https://steamcommunity.com/app/\" + gameInfo['appid'] );

	// Achievement block, if present.
	if( gameInfo['ach_completion'] && gameInfo['ach_completion']['closed'] > 0 )
	{
		gameInfo['ach_completed'] = gameInfo['ach_completion']['closed'];
		gameInfo['ach_total'] = gameInfo['ach_completion']['total'];
		gameInfo['ach_bar_width'] = 185 * ( gameInfo['ach_completed'] / gameInfo['ach_total'] );
		gameInfo['ach_bar_width_remainder'] = 185 - gameInfo['ach_bar_width'];

		var achievements = '';

		gameInfo['ach_completion']['recent_achievements'].each(function( achievement, index ) {
			achievements += gameAchievementItemTemplate.evaluate( achievement );
		});
		gameInfo['achievements'] = achievements;
		gameInfo['achievement_block'] = gameAchievementBlockTemplate.evaluate( gameInfo );
	}

    if ( gameInfo['client_summary'] )
    {
		UpdateGameInfoFromSummary( gameInfo, gameInfo['client_summary'] );
    }

	// Handle stats links
	var statsLinks = '';

	// Handle profile-own game specific data
	var gcpdLinks = '';

	if( gameInfo['availStatLinks'] )
	{
		if( gameInfo['availStatLinks']['achievements'] )
			statsLinks += gameStatsAchievementsTemplate.evaluate( gameInfo );

		if( gameInfo['availStatLinks']['stats'] )
			statsLinks += gameStatsUserTemplate.evaluate( gameInfo );

		if( gameInfo['availStatLinks']['gcpd'] && bViewingOwnProfile )
			gcpdLinks += gamePersonalDataUserTemplate.evaluate(gameInfo);

		if( gameInfo['availStatLinks']['leaderboards'] )
			statsLinks += gameStatsLeaderboardTemplate.evaluate( gameInfo );

		if( gameInfo['availStatLinks']['global_achievements'] )
			statsLinks += gameStatsGlobalAchievementsTemplate.evaluate( gameInfo );

		if( gameInfo['availStatLinks']['global_leaderboards'] )
			statsLinks += gameStatsGlobalLeaderboardsTemplate.evaluate( gameInfo );

		if( tab == 'recent' || tab == 'all' || tab == 'followed' )
		{
			if( tab == 'recent' && gameInfo['hours'] && gameInfo['hours_forever'] && gameInfo['hours'] != '0.0' )
			{
				gameInfo['hours_message'] = gameHoursRecentTemplate.evaluate( gameInfo );
			}
			else if( gameInfo['hours_forever'] )
			{
				gameInfo['hours_message'] = gameHoursForeverTemplate.evaluate( gameInfo );
			}
		}
	}

	var linkspopup = gameLinksPopupTemplate.evaluate( gameInfo );

	var div = new Element('div', {'class': 'popup_block2', id: 'links_dropdown_' + gameInfo['appid'] } );
	div.innerHTML = linkspopup;
	div.hide();
	$(document.body).appendChild(div);

	if( statsLinks )
	{
		gameInfo['stats_links'] = statsLinks;
		gameInfo['stats_button'] = gameStatsTemplate.evaluate(gameInfo);

		var e = new Element('div', {'class': \"popup_block2\", 'id': \"stats_dropdown_\" + gameInfo['appid']} );
		e.update( gameStatsPopupTemplate.evaluate( gameInfo ) );
		e.hide();
		$(document.body).appendChild(e);
	}

	if( gcpdLinks )
	{
		gameInfo['gcpd_links'] = gcpdLinks;
		gameInfo['gcpd_button'] = gamePersonalDataTemplate.evaluate(gameInfo);

		var e = new Element('div', {'class': \"popup_block2\", 'id': \"gcpd_dropdown_\" + gameInfo['appid']} );
		e.update( gamePersonalDataPopupTemplate.evaluate( gameInfo ) );
		e.hide();
		$(document.body).appendChild(e);
	}

	var html = gameTemplate.evaluate( gameInfo );

	var div = new Element('div', {'class': 'gameListRow', id: 'game_' + gameInfo['appid'] } );
	if ( gameInfo.item_background )
		div.addClassName( gameInfo.item_background );

	div.innerHTML = html;
	$('games_list_rows').appendChild(div);

	var strDelayGroup = 'game_logo_' + gameInfo['appid'];
	g_rgDelayedLoadImages[strDelayGroup] = [ gameInfo['logo'] ];
	LoadImageGroupOnScroll( 'game_' + gameInfo['appid'], strDelayGroup );
}