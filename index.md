---
layout: default
---

<div class="blog-index">  
<h1>Latest Post</h1>
{% for post in site.posts limit:2 %}
... Show the first post all big ...
{% endfor %}
</div>