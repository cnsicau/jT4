jT4
===

a JavaScript T4 template engine

----------------------------------------------------
example:
<pre>
   <script type="text/script" src="jT4.js"></script>
   <script type="text/script" src="jQuery-****.js"></script>
   <script type="text/jT4-template" id="myTemplate">
       Hi, <#= displayName #>
   </script>
   <script type="text/script">
       var data = {displayName: "Mr Lotech"};
       var template = $('#myTemplate').html();
       var text = jT4.compile(template)(data);
       //  text=> Hi, Mr Lotech
   </script>
</pre>
