---
---
var INDEX = [
      {% for item in site.data.resources %}
        {{ item || jsonify }},
      {% endfor %}
      {% for item in site.data.searchable-resources %}
        {{ item || jsonify }}{% unless forloop.last %},{% endunless %}
      {% endfor %}
    ],
    fuse = new Fuse(INDEX, {
      caseSensitive: false,
      includeScore: true,
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 128,
      keys: ['title', 'name', 'description', 'tags']
    });

$( document ).ready(function() {
  var query = GetURLParameter('q'),
      result;

  if (!query) return;

  $("input#q").val(query);
  $("#search-result-list").append(
    '<div class="loading"><span class="glyphicon glyphicon-refresh"></span> Loading</div>'
  );

  result = fuse.search(query).map(function(item) {
    item.item.title = item.item.title || item.item.name;
    item.item.content_type = (item.item.url.match(/\.pdf$/)) ?
      'application/pdf' : 'text/html';
    return item;
  });

  $(".loading").remove();
  $("#search-form").append(
    '<div class="search-results-total"><span class="search-result-number">' +
    result.length + '</span> Search Results</div>'
  );
  $.each(result, function(i, hit){
    var result_description = hit.item.description,
        tags = '',
        content_type = '';

    if(hit.item.tags) {
      tags += '<div class="search-result-tags">Tags:<ul>';
      $.each(hit.item.tags, function(i, tag) {
        tags += '<li><a href="/search/?q=' + tag + '">' + tag + '</a></li>';
      });
      tags += "</ul></div>";
    }

    if(hit.item.content_type == "text/html") {
      content_type = '<span class="glyphicon glyphicon-link"></span> Website';
    }
    else if(hit.item.content_type == "application/pdf") {
      content_type = '<span class="glyphicon glyphicon-file"></span> PDF';
    }
    else {
      content_type = '<span class="glyphicon glyphicon-file"></span> ' + hit.item.content_type + '';
    }

    $("#search-result-list").append(
      '<article class="search-result">' +
        '<header class="search-result-header">' +
          '<a href="' + hit.item.url + '" target="_blank">' + hit.item.title + '</a>' +
        '</header>' +
        '<div class="search-result-content">' +
          result_description +
          tags +
        '</div>' +
        '<div class="search-result-meta">' +
          '<div class="search-result-meta-item">' +
            '</div>' +
            '<div class="search-result-meta-item-content">' +
              content_type +
            '</div>' +
            '<div class="search-result-meta-item-content">' +
              '<span class="glyphicon glyphicon-arrow-right"></span> <a href="' + hit.item.url + '" target="_blank">View Document</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>'
    );

  });

});

function GetURLParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return decodeURIComponent(sParameterName[1].replace(/\+/g, ' '));
    }
  }
}
