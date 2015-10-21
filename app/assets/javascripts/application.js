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
	//constant values for each gem type
	var ALEXANDRITE = 0;
	var AMBER = 1;
	var CITRINE = 2;
	var GARNET = 3;
	var OPAL = 4;
	var PERIDOT = 5;
	var QUARTZ = 6;
	var TANZANITE = 7;
	var TURQUOISE = 8;

	var radius = 200;
	var circumference = 2 * Math.PI * radius;
	var timer = 51;

	//initialize grid array
	for(var grid = []; grid.length < 12; grid.push([]));
	var endNodes = [];

	//creates the grid html elements
	var createGrid = function()
	{
		//12 rows
		for(var k = 0; k < 12; k++)
		{
			//20 columns
			for(var i = 0; i < 20; i++)
			{
				//appends a grid element with the id of each cell ex. id="1,8"
				$('#main').append('<div id="' + k + ',' + i + '" class="grid"></div>');
				$('.grid').last().addClass('col'.concat(i));
				$('.grid').last().addClass('row'.concat(k));

				//places the new element into the grid array
				grid[k].push($('.grid').last());
			}
		}
	};

	//when the user clicks on the new game button
	$('#new_game').on('click', function()
	{
		var level = 0;
		$('#new_game').hide();

		//button to start the wave of enemies
		$('#right').append('<div id="startWave">Start Wave</div>');

		//display more options: difficulty, map, game type, etc.

		//create the enemies
		for(var n = 0; n < 10; n++)
		{
			$('#main').append('<div id="'+ n +'" class="enemy faceEast"></div>');
		}

		//invoke grid
		createGrid();

		//get first point by parsing the id of the first map point
		var row = parseInt(map1[0].split(',', 1));
		var col = parseInt(map1[0].split(',').pop());
		var point1 = grid[row][col];
		point1.addClass('start');

		//reposition enemies to start at the first point and hide them until the wave starts
		for(var n = 0; n < 10; n++)
		{
			$('.enemy:eq('+ n +')').offset({top: point1.offset().top, left: point1.offset().left});
		}
		$('.enemy').hide();

		//finds the shortest path from the first point of the map to the end of the map
		//returns an array of arrays that contain the cells of the shortest path from each starting point to its goal
		//if the path between two points is impossible, the array for that point will be empty
		var findShortestPath = function()
		{
			var results = [];
			point1 = grid[0][0];

			//go through each mandatory point in the map and search for the shortest path between them
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

				//this uses astar search to find the shortest path from start to end
				var result = astar.search(grid, start, end, true);
				results.push(result);
			}
			return results;
		};

		//get shortest path
		var results = findShortestPath();

		//process shortest path and add CSS to show path
		for(var k = 0; k < results.length; k++)
		{
			for(var j = 0; j < results[k].length; j++)
			{
				results[k][j].addClass('path');
			}
		}

		//blinks the mandatory points the enemies must go through in order
		var startBlink = setInterval(function()
		{
			$('.start').toggleClass('blink');
		},1000);
		var endBlink = setInterval(function()
		{
			$('.end').toggleClass('blink');
		},1000);

		//formats the id to include the whole id with the comma
		function jq( id ) {
    	return "#" + id.replace( /(:|\.|\[|\]|,)/g, "\\$1" );
		}

		//checks to make sure a cell is valid for placing a tower
		//the path must be continuous so a tower cannot block one of the mandatory points
		//this is invoked on grid hover after selecting a tower to place
		var checkValid = function(div)
		{
			//checks each mandatory point
			//cannot place a tower on top of a mandatory point
			for(var i = 0; i < map1.length; i++)
			{
				if(div.attr('id') === map1[i])
				{
					return false;
				}
			}

			//cannot place another tower on top of a tower placed the same round
			if(div.hasClass('placedThisRound'))
			{
				return false;
			}

			//cannot replace a gem with another tower
			if(div.hasClass('gem'))
			{
				return false;
			}

			//checks to make sure a valid path would still exist if a tower was placed at that point
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

		//on click selects a tower
		//if the user presses 'k' while selected, tower becomes a gem and the other towers placed becomes a rock
		var selectGem = function()
		{
			//shows a border on hover
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

			//shows a border for the selected tower
			$('.grid').on('click', function()
			{
				if($(this).hasClass('rock'))
				{
					$('.range').remove();
					$('.grid').removeClass('selected');
					$(this).addClass('selected');
				}
				if($(this).hasClass('gem') || $(this).hasClass('placedThisRound'))
				{
					$('#main').append('<div class="range"></div>');
					$('.range').last().css('top', $(this).position().top - 175);
					$('.range').last().css('left', $(this).position().left - 175);
				}
				$(document).keypress(function(event)
				{
					event.preventDefault();

					//if the user presses 'k' while a tower is selected, it will become a gem
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

		//before the wave starts a player can place towers
		var nextLevel = function()
		{
			var rocksPlaced = 0;
			$(document).keypress(function(event)
			{
				//if the user presses 'r' they can then place towers on valid cells
				if (event.which == 114)
				{
	     		event.preventDefault();

					//on hover the cell will show green if it is valid or red if it is invalid
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

					//if valid, a tower will be randomly selected and placed where the user clicks.
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

							//the user is only allowed 5 towers per round
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

		//when the user clicks the start wave button
		$('#startWave').on('click', function(level)
		{
			$(document).off('keypress');
			$('.grid').unbind('mouseenter mouseleave click');
			$('.grid').removeClass('selected');
			$('#startWave').hide();

			//find the shortest path from start to end
			var results = findShortestPath();
			var path = [];

			//processs results
			for(var k = 0; k < results.length; k++)
			{
				for(var j = 0; j < results[k].length; j++)
				{
					path.push(results[k][j]);
				}
			}
			var enemyCount = 0;

			//starts the wave and shows the enemies one at a time
			var beginWave = setInterval(function()
			{
				var pathCount = 0;
				$('.enemy:eq('+ enemyCount +')').fadeIn('fast');

				//invokes moveEnemy
				moveEnemy($('.enemy:eq('+ enemyCount +')'), pathCount);
				enemyCount++;

				//10 enemies
				if(enemyCount === 10)
				{
					//makes the enemiees visible
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

			var shoot = function(bullet, enemy, XdistanceToTower, YdistanceToTower, interval)
			{
				var distance = Math.sqrt(XdistanceToTower * XdistanceToTower + YdistanceToTower * YdistanceToTower);
				var time = 5;
				var velx = XdistanceToTower / time;
				var vely = YdistanceToTower / time;

				bullet.css('top', bullet.position().top + vely);
				bullet.css('left', bullet.position().left + velx);

				//bullet is going to the right
				if(velx > 0 && bullet.position().left + 25 > enemy.position().left)
				{
					//bullet is going up
					if(vely < 0 && bullet.position().top - 25 < enemy.position().top)
					{
						bullet.remove();
						clearInterval(interval);
					}
					//bullet is going down
					if(vely > 0 && bullet.position().top + 25 > enemy.position().top)
					{
						bullet.remove();
						clearInterval(interval);
					}
					//bullet is going straight right
					if(vely == 0)
					{
						bullet.remove();
						clearInterval(interval);
					}
				}

				//bullet is going left
				if(velx < 0 && bullet.position().left - 25 < enemy.position().left)
				{
					//bullet is going up
					if(vely < 0 && bullet.position().top - 25 < enemy.position().top)
					{
						bullet.remove();
						clearInterval(interval);
					}
					//bullet is going down
					if(vely > 0 && bullet.position().top + 25 > enemy.position().top)
					{
						bullet.remove();
						clearInterval(interval);
					}
					//bullet is going straight left
					if(vely == 0)
					{
						bullet.remove();
						clearInterval(interval);
					}
				}
				//bullet is going straight up or down
				if(velx == 0)
				{
					//bullet is going up
					if(vely < 0 && bullet.position().top - 25 < enemy.position().top)
					{
						bullet.remove();
						clearInterval(interval);
					}
					//bullet is going down
					if(vely > 0 && bullet.position().top + 25 > enemy.position().top)
					{
						bullet.remove();
						clearInterval(interval);
					}
				}

			};

			//creates a bullet at the tower that is in range
			var createBullet = function(tower)
			{
				$('#main').append('<div class="bullet"></div>');
				var bullet = $('.bullet').last();
				bullet.css('top', tower.position().top + 20);
				bullet.css('left', tower.position().left + 20);
				return bullet;
			};

			//checks to see if an enemy is whithin range of a tower and calls the shoot interval
			var checkRange = function(enemy)
			{
				//loops through each tower and checks range of enemy
				for(var i = 0; i < $('.gem').length; i++)
				{
					var tower = $('.gem:nth('+ i +')');
					var XdistanceToTower = enemy.position().left - tower.position().left;
					var YdistanceToTower = enemy.position().top - tower.position().top;
					var distance = Math.sqrt(XdistanceToTower * XdistanceToTower + YdistanceToTower * YdistanceToTower);
					//if the tower is within range
					if(distance < radius && timer > 20)
					{
							timer = 0;
							var x = XdistanceToTower;
							var y = YdistanceToTower;
							var bullet = createBullet(tower);
							var interval;
							interval = setInterval( function() { shoot(bullet, enemy, x, y, interval); }, 10);
					}
				}
			};

			//moves each enemy along the shortest path
			var moveEnemy = function(enemy, pathCount)
			{
				var move = setInterval(function()
				{
					timer++;
					var nextPos = path[pathCount];
					checkRange(nextPos);
					if(nextPos.position().left == enemy.position().left && nextPos.position().top == enemy.position().top)
					{
						pathCount++;
					}
					//moves right
					if(nextPos.position().left > enemy.position().left)
					{
						enemy.removeClass('faceSouth faceNorth faceWest faceSoutheast faceSouthwest faceNortheast faceNorthwest faceEast');
						enemy.css('left', enemy.position().left + 5);
						/*if(nextPos.position().top > enemy.position().top)
						{
							enemy.addClass('faceSoutheast');
						}
						else if(nextPos.position().top < enemy.position().top)
						{
							enemy.addClass('faceNortheast');
						}
						else
						{
							enemy.addClass('faceEast');
						}*/
						enemy.addClass('faceEast');
					}
					//moves left
					else if(nextPos.position().left < enemy.position().left)
					{
						enemy.removeClass('faceSouth faceNorth faceWest faceSoutheast faceSouthwest faceNortheast faceNorthwest faceEast');
						enemy.css('left', enemy.position().left - 5);
						/*if(nextPos.position().top > enemy.position().top)
						{
							enemy.addClass('faceSouthwest');
						}
						else if(nextPos.position().top < enemy.position().top)
						{
							enemy.addClass('faceNorthwest');
						}
						else
						{
							enemy.addClass('faceWest');
						}*/
						enemy.addClass('faceWest');
					}
					//moves down
					if(nextPos.position().top > enemy.position().top)
					{
						enemy.removeClass('faceSouth faceNorth faceWest faceSoutheast faceSouthwest faceNortheast faceNorthwest faceEast');
						enemy.css('top', enemy.position().top + 5);
						/*if(nextPos.position().left > enemy.position().left)
						{
							enemy.addClass('faceSoutheast');
						}
						else if(nextPos.position().left < enemy.position().left)
						{
							enemy.addClass('faceSouthwest');
						}
						else
						{
							enemy.addClass('faceSouth');
						}*/
						enemy.addClass('faceSouth');
					}
					//moves up
					else if(nextPos.position().top < enemy.position().top)
					{
						enemy.removeClass('faceSouth faceNorth faceWest faceSoutheast faceSouthwest faceNortheast faceNorthwest faceEast');
						enemy.css('top', enemy.position().top - 5);
						/*if(nextPos.position().left > enemy.position().left)
						{
							enemy.addClass('faceNortheast');
						}
						else if(nextPos.position().left < enemy.position().left)
						{
							enemy.addClass('faceNorthwest');
						}
						else
						{
							enemy.addClass('faceNorth');
						}*/
						enemy.addClass('faceNorth');
					}

					//if the path is at the end, the enemies are removed
					if(pathCount === path.length)
					{
						setTimeout(function()
						{
	    				enemy.fadeOut('fast');
						},100);
						clearInterval(move);
					}
				},20);
			};
		});
	});
};

$(document).ready(ready);
$(document).on('page:load', ready);
