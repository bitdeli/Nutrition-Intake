$(function() {

var w = 960,
    h = 960,
    format = d3.format(",d"),
    fill = d3.scale.category20b();

// Load data from Bitdeli
var sourceId = "i-04bb3fe3b92b1b-e31198a8",
    groupsUrl = "https://out.bitdeli.com/v1/data/"+sourceId+"/groups/";

// Get group from Bitdeli
function loadGroup(groupId) {
  var items = [],
      initialUrl = groupsUrl+groupId+"?max=100";

  getWholeGroup(initialUrl, function(items) {
    redraw([{
      name: foodgroups[groupId],
      foods: _(items).pluck("object")
    }]);
  });

  function getWholeGroup(url, complete) {
    $.getJSON(url, function(json) {
      items.push.apply(items, json.items);
      if (json.next) {
        getWholeGroup(json.next, complete);
      } else {
        complete.call(this, items);
      }
    });
  }
}

// Redraw visualization
function redraw(data) {
  $("#main").empty();
  $('h1').text(data[0].name);

  var pack = d3.layout.pack()
      .size([w - 4, h - 4])
      .sort(null)
      .value(getRdiFraction)
      .children(getRdiChildren);

  var vis = d3.select("#main").append("svg:svg")
      .attr("width", w)
      .attr("height", h)
      .attr("class", "pack")
      .append("svg:g")
      .attr("transform", "translate(2, 2)");

  var node = vis.data(data).selectAll('g.node')
      .data(pack.nodes)
      .enter().append('svg:g')
      .attr('transform', function(d) { return "translate(" + d.x + "," + d.y + ")";});

  node.append("svg:title")
      .text(function(d) {return d.name || nutrients[d.id].name});

  node.append("svg:circle")
      .attr("r", function(d) {return d.r})
      .style("fill", function(d) {return _.isUndefined(nutrients[d.id]) ? "#aaa" : fill(nutrients[d.id].name)})
      .attr("class", function(d) {
       return _.isUndefined(nutrients[d.id]) ? "" : "nut c" + d.id;
      })
      .attr("fill-opacity", function(d) {return _.isUndefined(nutrients[d.id]) ? 0.5 : 0.7});

  // Attach mouse handlers
  $('.nut').hover(function() {
    var curC = $(this).attr("class").substr(4);
    $('.'+curC).css({"fill-opacity":"1"});
    $('h2').text(nutrients[parseFloat(curC.substr(1))].name);
  }, function() {
    var curC = $(this).attr("class").substr(4);
    $('.'+curC).css({"fill-opacity":".7"});
    $('h2').text("");
  });

  function getRdiChildren(parent) {
    if (parent.foods) {
      return _(parent.foods).filter(function(food) {
        return rdiFiltered(food).length > 0;
      });
    } else if (parent.nutrients) {
      return rdiFiltered(parent);
    } else {
      return undefined;
    }
  }

  function rdiFiltered(food) {
    return _(food.nutrients).filter(function(nut) {
      return recommendations[nut.id];
    });
  }

  function getRdiFraction(nut) {
    return nut.amount/recommendations[nut.id]['rdi'];
  }
}

// Initialize group changer
var changer = $("#group-changer");
changer.append(_(foodgroups).map(function(name, id) {
  return $("<option/>").text(name).attr("value", id)[0];
})).change(function() {
  loadGroup(changer.val());
});

// Set initial group
changer.val(2200).change();

});
