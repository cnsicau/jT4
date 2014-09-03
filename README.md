jT4
===

a JavaScript T4 template engine

----------------------------------------------------
example:
<pre>
   &lt;script type="text/script" src="jT4.js"&gt;&lt;/script&gt;
   &lt;script type="text/script" src="jQuery-****.js"&gt;&lt;/script&gt;
   &lt;script type="text/jT4-template" id="myTemplate"&gt;
       Hi, &lt;#= displayName #&gt;
   &lt;/script&gt;
   &lt;script type="text/script"&gt;
       var data = {displayName: "Mr Lotech"};
       var template = $('#myTemplate').html();
       var text = jT4.compile(template)(data);
       //  text=&gt; Hi, Mr Lotech
   &lt;/script&gt;
</pre>
