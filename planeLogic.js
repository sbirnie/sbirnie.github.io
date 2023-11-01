var currentPlane = 0;
var maxPlanes = 0;
var shuffledPlanes;

// Constants
var PHENOMENON_CLASS = "phenom-plane";

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

    // Create the list of checkboxes for the planes
    allPlanes.data.forEach(plane => {
        if (plane.set_name != currentSetName) {
            if (currentSetName != "") {
                $('#accordion').append('</div>')
            }

            $('#accordion').append('<h3>' + plane.set_name + '</h3><div id="' + plane.set + '">')
            currentSetName = plane.set_name
            // create the All checkbox within this specific group.
            $('#' + plane.set).append('<div class="form-check"><input class="form-check-input allCheck" type="checkbox" value="" id="' + plane.set + 'AllCheck"><label class="form-check-label" for="' + plane.set + 'allCheck">All</label></div>')
        }

        var isPhenom = ""
        if (plane.type_line == "Phenomenon") {
            isPhenom = PHENOMENON_CLASS;
        }
        $('#' + plane.set).append('<div class="form-check"><input class="' + isPhenom + ' plane-check form-check-input" type="checkbox" value="" data-name="' + plane.name + '" id="' + plane.id + '"><label class="plane-label form-check-label" for="' + plane.id + '">' + plane.name + '</label></div>')
    });
    $('#accordion').append('</div>')
    $('#accordion').accordion({
        collapsible: true,
        heightStyle: "content"
    });

    // create the handler for the All checkboxes for each group
    $(".allCheck").change(function () {
        var checkSet = this.id.slice(0, -8);
        if (this.checked) {
            $('#' + checkSet + ' .plane-check').prop('checked', true);
        } else {
            $('#' + checkSet + ' .plane-check').prop('checked', false);
        }
        // uncheck phenoms
        if ($('#ignorePhenomenon').prop('checked') == true) {
            $('#' + checkSet + ' .' + PHENOMENON_CLASS).prop('checked', false)
        }
    });

    // create the hover tooltip for all the plane texts (plane-label class)
    $('#gameSetup').uitooltip({
        items: '.plane-label',
        track: true,
        content: function () {
            var element = $( this );
            var plane = allPlanes.data.find(x => x.id === element.attr('for'));
            if (plane) {
                return "<div class='card bg-light ' >" + 
                //"<img src='" + plane.image_uris.small + "'>" +
                "<div class='card-header'>" + plane.name + "</div>" +
                "<div class='card-body'>" +
                    "<h6 class='card-subtitle text-muted'>" + plane.type_line + "</h5>" +
                    "<p class='card-text'>" + plane.oracle_text + "</p>" +
                "</div></div>";
            } else {
                return "plane not found";
            }
        }
    });

    /*
    $('#selectHeader').uitooltip({
        track: true,
        content: function () {
            var element = $( this );
            return "custom tooltip";
        }
    });
    */

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
    $('#planeInfoCard').hide()

    $('#selectAll').click(function () {
        var planeCheckBoxes = $('.plane-check');
        planeCheckBoxes.each(function (idx, cb) {
            var $chxbx = $(cb);
            if ($chxbx.hasClass(PHENOMENON_CLASS) && $('#ignorePhenomenon').prop('checked') == true) {
                $chxbx.prop('checked', false)
            } else {
                $chxbx.prop('checked', true)
            }
        })
        $('.allCheck').prop('checked', true);
    })

    $('#clearAll').click(function () {
        var planeCheckBoxes = $('.plane-check');
        planeCheckBoxes.each(function (idx, cb) {
            var $chxbx = $(cb);
            $chxbx.prop('checked', false)
        })
        $('.allCheck').prop('checked', false);
    })

    $('#ignorePhenomenon').change(function () {
        if (this.checked) {
            $('.' + PHENOMENON_CLASS).prop('checked', false);
            $('.' + PHENOMENON_CLASS).prop('disabled', true);
        } else {
            $('.' + PHENOMENON_CLASS).prop('disabled', false);
        }
    })

    $('#gameBtn').click(function () {
        if ($('#playGame').is(':hidden')) {
            // check if any were checked
            var selectedCheckboxes = getSelectedCheckboxes();
            if (selectedCheckboxes.length < 2) {
                alert('Select at least 2 planes before starting.')
                return
            }
            // get/create array of selected planes.
            var selectedPlanes = allPlanes.data.filter(function (el) {
                return selectedCheckboxes.includes(el.id)
            })

            //don't think this is needed anymore.  We're unchecking phenoms when the checkbox is selected
            /*
            if ($('#ignorePhenomenon').prop('checked') == true) {
                index = selectedPlanes.length - 1;

                while (index >= 0) {
                    if (selectedPlanes[index].type_line === "Phenomenon") {
                        selectedPlanes.splice(index, 1);
                    }

                    index -= 1;
                }
            }
            */

            if (selectedPlanes.length < 2) {
                alert('Select at least 2 planes before starting.')
                return
            }

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