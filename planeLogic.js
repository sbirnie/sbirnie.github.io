var currentPlane = 0;
var maxPlanes = 0;
var shuffledPlanes;

function knuthShuffle(arr) {
    var rand, temp, i;

    for (i = arr.length - 1; i > 0; i -= 1) {
        rand = Math.floor((i + 1) * Math.random());//get random between zero and i (inclusive)
        temp = arr[rand];
        arr[rand] = arr[i]; //swap i (last element) with random element.
        arr[i] = temp;
    }
    return arr;
}

function showPlane(arr, id) {
    $('#planeImage').attr('src', arr[id].image_uris.large);
    $('#planeImage').attr('alt', arr[id].name);
    $('#planeImage').css({
        'transform': 'rotate(90deg)'
    });
}

function setupGameOptions() {
    $('#selectAll').show();
    $('#clearAll').show();

    currentSetName = "";

    allPlanes.data.forEach(plane  => {
        if (plane.set_name != currentSetName) {
            if (currentSetName != "") {
                $('#accordion').append('</div>')
            }

            $('#accordion').append('<h3>' + plane.set_name + '</h3><div id="' + plane.set + '">')
            currentSetName = plane.set_name
        }
        $('#' + plane.set).append('<div class="form-check"><input class="plane-check form-check-input" type="checkbox" value="" data-name="' + plane.name + '" id="' + plane.id + '"><label class="form-check-label" for="' + plane.id + '">' + plane.name + '</label></div>')
    });
    $('#accordion').append('</div>')

    $('#accordion').accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });
    $("#accordion .ui-accordion-content").show();

}

function getSelectedCheckboxes() {
    var arrayOfCheckboxes = [];
    var planeCheckBoxes = $('.plane-check');
    planeCheckBoxes.each(function (idx, cb) {
        var $chxbx = $(cb);
        if ($chxbx.prop('checked') == true) {
            arrayOfCheckboxes.push($chxbx.prop('id'));
        }
    })
    return arrayOfCheckboxes;
}

function initialSetup() {
    currentPlane = 0;
    maxPlanes = 0;

    setupGameOptions()
    $('.game-setup').show()
    $('.game-play').hide()

    $('#selectAll').click(function () {
        var planeCheckBoxes = $('.plane-check');
        planeCheckBoxes.each(function (idx, cb) {
            var $chxbx = $(cb);
            $chxbx.prop('checked', true)
        })
    })

    $('#clearAll').click(function () {
        var planeCheckBoxes = $('.plane-check');
        planeCheckBoxes.each(function (idx, cb) {
            var $chxbx = $(cb);
            $chxbx.prop('checked', false)
        })
    })

    $('#gameBtn').click(function () {
        if ($('#playGame').is(':hidden')) {
            // check if any were checked
            var selectedCheckboxes = getSelectedCheckboxes();
            if (selectedCheckboxes.length < 2) {
                alert('Select at least 2 planes before starting.')
                return
            }
            // get/create array of selected planes.  right now we're just using all planes
            selectedCheckboxes  = getSelectedCheckboxes();
            var selectedPlanes = allPlanes.data.filter(function (el) {
                return selectedCheckboxes.includes(el.id)
            }
            )

            //var selectedPlanes = allPlanes.data

            // shuffle
            shuffledPlanes = knuthShuffle(selectedPlanes)
            maxPlanes = selectedPlanes.length

            // setup new game
            currentPlane = 0

            // show first plane
            showPlane(shuffledPlanes, currentPlane)

            // show game area and hide setup area
            $('.game-setup').hide()
            $('.game-play').show()
            $('#prevBtn').hide()
            $('#nextBtn').show()
            $('#gameBtn').text("End Game")
        } else {
            // End game.
            // show options for game
            currentPlane = 0;
            $('.game-setup').show()
            $('.game-play').hide()
            $('#selectAll').show()
            $('#clearAll').show()
            $('#gameBtn').text("Play")
        }
    })

    $('#prevBtn').click(function () {
        if (currentPlane > 0) {
            currentPlane--
            showPlane(shuffledPlanes, currentPlane)
        }

        $('#nextBtn').show()

        if (currentPlane == 0) {
            $('#prevBtn').hide()
        } else {
            $('#prevBtn').show()
        }
    })

    $('#nextBtn').click(function () {
        if (currentPlane < maxPlanes - 1) {
            currentPlane++
            showPlane(shuffledPlanes, currentPlane)
        }

        $('#prevBtn').show()

        if (currentPlane == maxPlanes - 1) {
            $('#nextBtn').hide()
        } else {
            $('#nextBtn').show()
        }
    })

    $('#moveToEndBtn').click(function () {
        shuffledPlanes.push(shuffledPlanes.splice(currentPlane, 1)[0])
        showPlane(shuffledPlanes, currentPlane)
    })
}
