---
layout: default
---

<div id="post-list">

{% for post in posts limit:2 %}

  <div class="post-preview">
    <div class="d-flex justify-content-between pr-xl-2">
      <h1><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h1>
      {% if post.pin == true %}
        <i class="fas fa-thumbtack fa-fw text-muted mt-1 ml-2 mt-xl-2" data-toggle="tooltip" data-placement="left"
        title="Pinned"></i>
      {% endif %}
    </div>
    <div class="post-content">
      {%- capture img_placehodler -%}
        data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7
      {% endcapture%}

      {% if post.youtube_id %}
        <div class="embed-responsive embed-responsive-16by9 post-preview-img">
          <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/{{post.youtube_id}}?controls=0"
          frameborder="0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      {% elsif post.image %}
        <img src="{{ img_placehodler }}" data-src="{{ post.image }}" class="post-preview-img">
      {% endif %}

      {% if post.excerpt and post.content contains '<!--more-->' %}
        {{post.excerpt}}
      {% else  %}
        {{ post.content |  strip_html | truncate: 400, '...' }}
      {% endif%}

    </div>

    <p>
      <a href="{{ post.url | relative_url }}" class="btn-chang-bg-on-hover">{{ site.data.label.read_more }}</a>
    </p>

    <div class="post-meta text-muted">
      <!-- posted date -->
      <i class="far fa-clock fa-fw"></i>
      {% include timeago.html date=post.date tooltip=true %}

      <!-- page views -->
      {% if site.google_analytics.pv.enabled %}
      <i class="far fa-eye fa-fw"></i>
      <span id="pv_{{-post.title-}}" class="pageviews">
        <i class="fas fa-spinner fa-spin fa-fw"></i>
      </span>
      {% endif %}
    </div>

  </div> <!-- .post-review -->

{% endfor %}

</div> 
</div>