// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .


var ready = function() {
	var ALEXANDRITE = 0;
	var AMBER = 1;
	var CITRINE = 2;
	var GARNET = 3;
	var OPAL = 4;
	var PERIDOT = 5;
	var QUARTZ = 6;
	var TANZANITE = 7;
	var TURQUOISE = 8;
	for(var grid = []; grid.length < 12; grid.push([]));
	var endNodes = [];
	var createGrid = function()
	{
		var j = 0;
		for(var k = 0; k < 12; k++)
		{
			for(var i = 0; i < 20; i++)
			{
				$('#main').append('<div id="' + k + ',' + i + '" class="grid"></div>');
				$('.grid').last().addClass('col'.concat(i));
				$('.grid').last().addClass('row'.concat(k));
				grid[k].push($('.grid').last());
			}
		}
	};

	//when the user clicks on the new game button
	$('#new_game').on('click', function()
	{
		var level = 0;
		$('#new_game').hide();
		$('#right').append('<div id="startWave">Start Wave</div>');
		//display more options: difficulty, map, game type, etc.

		for(var n = 0; n < 10; n++)
		{
			$('#main').append('<div id="'+ n +'" class="enemy"></div>');
		}
		createGrid();
		var row = parseInt(map1[0].split(',', 1));
		var col = parseInt(map1[0].split(',').pop());
		var point1 = grid[row][col];
		point1.addClass('start');
		for(var n = 0; n < 10; n++)
		{
			$('.enemy:eq('+ n +')').offset({top: point1.offset().top, left: point1.offset().left});
		}
		$('.enemy').hide();

		var findShortestPath = function()
		{
			var results = [];
			point1 = grid[0][0];
			for(var i = 1; i < map1.length; i++)
			{
				if(point2)
				{
					point2.removeClass('end');
					point1 = point2;
					point1.addClass('start');
				}
				row = parseInt(map1[i].split(',', 1));
				col = parseInt(map1[i].split(',').pop());
				var point2 = grid[row][col];
				point2.addClass('end');
				var end = point2;
				var start = point1;
				var result = astar.search(grid, start, end, true);
				results.push(result);
			}
			return results;
		};

		var results = findShortestPath();
		for(var k = 0; k < results.length; k++)
		{
			for(var j = 0; j < results[k].length; j++)
			{
				results[k][j].addClass('path');
			}
		}

		var startBlink = setInterval(function()
		{
			$('.start').toggleClass('blink');
		},1000);
		var endBlink = setInterval(function()
		{
			$('.end').toggleClass('blink');
		},1000);

		function jq( myid ) {
    	return "#" + myid.replace( /(:|\.|\[|\]|,)/g, "\\$1" );
		}

		var checkValid = function(div)
		{
			for(var i = 0; i < map1.length; i++)
			{
				if(div.attr('id') === map1[i])
				{
					return false;
				}
				if(div.hasClass('placedThisRound'))
				{
					return false;
				}
				if(div.hasClass('gem'))
				{
					return false;
				}
			}
			if(!div.hasClass('rock'))
			{
				div.addClass('rock');
				var result = findShortestPath();
				div.removeClass('rock');
				for(var i = 0; i < result.length; i++)
				{
					if(result[i].length === 0)
					{
						return false;
					}
				}
			}
			return true;
		};

		var selectGem = function()
		{
			$('.grid').hover(function()
			{
				if($(this).hasClass('rock'))
				{
					$(this).addClass('hoverBorder');
				}
			}, function()
			{
				$(this).removeClass('hoverBorder');
			});
			$('.grid').on('click', function()
			{
				if($(this).hasClass('rock'))
				{
					$('.grid').removeClass('selected');
					$(this).addClass('selected');
				}
				$(document).keypress(function(event)
				{
					event.preventDefault();
					if(event.which == 107)
					{
						if($('.selected').hasClass('placedThisRound'))
						{
							$('.selected').addClass('gem');
							$('.selected').removeClass('placedThisRound selected');
							$('.placedThisRound').removeClass('alexandrite amber citrine garnet opal peridot quartz tanzanite turquoise placedThisRound hoverValid');
						}
					}
				});
			});
		};

		var nextLevel = function()
		{
			var rocksPlaced = 0;
			$(document).keypress(function(event)
			{
				if (event.which == 114)
				{
	     		event.preventDefault();
					$('.grid').hover(function()
					{
						if(checkValid($(this)) && rocksPlaced < 5)
						{
	    				$(this).addClass('hoverValid');
						}
						else if(rocksPlaced < 5)
						{
							$(this).addClass('hoverInvalid');
						}
					}, function()
					{
	    			$(this).removeClass('hoverValid');
						$(this).removeClass('hoverInvalid');
					});

					$('.grid').on('click', function()
					{
						if(checkValid($(this)) && rocksPlaced < 5)
						{
							rocksPlaced++;
							var seed = Math.floor((Math.random() * 9));
							switch(seed)
							{
								case 0:
									$(this).addClass('alexandrite');
									break;
								case 1:
									$(this).addClass('amber');
									break;
								case 2:
									$(this).addClass('citrine');
									break;
								case 3:
									$(this).addClass('garnet');
									break;
								case 4:
									$(this).addClass('opal');
									break;
								case 5:
									$(this).addClass('peridot');
									break;
								case 6:
									$(this).addClass('quartz');
									break;
								case 7:
									$(this).addClass('tanzanite');
									break;
								case 8:
									$(this).addClass('turquoise');
									break;
							}
							$(this).addClass('rock');
							$(this).addClass('placedThisRound');
							if(rocksPlaced === 5)
							{
								$(document).off('keypress');
								$('.grid').unbind('mouseenter mouseleave click');
								selectGem();
							}
						}
					});
		 		}
			});
		};

		nextLevel();

		$('#startWave').on('click', function(level)
		{
			$(document).off('keypress');
			$('.grid').unbind('mouseenter mouseleave click');
			$('.grid').removeClass('selected');
			$('#startWave').hide();
			var results = findShortestPath();
			var path = [];
			for(var k = 0; k < results.length; k++)
			{
				for(var j = 0; j < results[k].length; j++)
				{
					path.push(results[k][j]);
				}
			}
			var enemyCount = 0;
			var beginWave = setInterval(function()
			{
				var pathCount = 0;
				$('.enemy:eq('+ enemyCount +')').fadeIn('fast');
				moveEnemy($('.enemy:eq('+ enemyCount +')'), pathCount);
				enemyCount++;
				if(enemyCount === 10)
				{
					var checkVisibility = setInterval(function()
					{
						if($('.enemy:visible').length === 0)
						{
							$('#startWave').show();
							level++;
							$('.enemy').show();
							for(var n = 0; n < 10; n++)
							{
								$('.enemy:eq('+ n +')').offset({top: grid[0][0].offset().top, left: grid[0][0].offset().left});
							}
							$('.enemy').hide();
							clearInterval(checkVisibility);
							nextLevel();
						}
					},300);
					clearInterval(beginWave);
				}
			},1000);
			var moveEnemy = function(enemy, pathCount)
			{
				var move = setInterval(function()
				{
					var nextPos = path[pathCount];
					if(nextPos.position().left > enemy.position().left + 30)
					{
						if(nextPos.position().top > enemy.position().top + 30)
						{
							enemy.animate({left: '+=50px', top: '+=50px'},200, 'swing');
						}
						else if(nextPos.position().top < enemy.position().top - 30)
						{
							enemy.animate({left: '+=50px', top: '-=50px'},200, 'swing');
						}
						else
						{
							enemy.animate({left: '+=50px'},200, 'swing');
						}
					}
					else if(nextPos.position().left < enemy.position().left - 30)
					{
						if(nextPos.position().top > enemy.position().top + 30)
						{
							enemy.animate({left: '-=50px', top: '+=50px'},200, 'swing');
						}
						else if(nextPos.position().top < enemy.position().top - 30)
						{
							enemy.animate({left: '-=50px', top: '-=50px'},200, 'swing');
						}
						else
						{
							enemy.animate({left: '-=50px'},200, 'swing');
						}
					}
					else if(nextPos.position().top > enemy.position().top + 30)
					{
						enemy.animate({top: '+=50px'},200, 'swing');
					}
					else
					{
						enemy.animate({top: '-=50px'},200, 'swing');
					}
					pathCount++;
					if(pathCount === path.length)
					{
						setTimeout(function()
						{
	    				enemy.fadeOut('fast');
						},300);
						clearInterval(move);
					}
				},300);
			};
		});
	});
};

$(document).ready(ready);
$(document).on('page:load', ready);
