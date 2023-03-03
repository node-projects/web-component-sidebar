# Web Component Sidebar
## What?

This is supposed to be a generic, multipurpose sidebar, that is going to be highly adaptable. At the moment, the sidebar is working and useable, but there will be lots of changes and improvements to come.

## How?

Use the sidebar by importing the web-component and adding it to the HTML DOM like this:

```html
<script  type="module">
	import  "./node_modules/web-component-sidebar/dist/sidebar-menu.js";
</script>
<style>
	#sidebar {
		/* --main-bg-color: #21333D;
		--main-font-color: #fff;*/
		--hover-bg-color: red;
		/* --selected-font-color: #fff;
		--submenu-border-color: #2E4A5A;
		--icon-bg-color: transparent;
		--sidebar-cell-height: 80px;
		--sidebar-icon-height: 60px; */
		/* --sidebar-cell-minwidth: 550px; */
		/*--font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		--font-size: 1.1rem; */
	}
</style>
<sidebar-menu  id="sidebar"  
	images-root="../../../assets"  
	menu-items='
		[
		   {
		       "id": "what-ever-you-set",
		       "displayName": "Sidebaritem",
		       "icon": "Sidebarlogo.svg",
		       "children": [
		           {
		               "id": "RBG1",
		               "displayName": "Sub-Sidebaritem",
		               "children": [
		                   {
		                       "id": "what-ever-you-set",
		                       "displayName": "Sub-Sidebaritem"
		                   },
		                   {
		                       "id": "what-ever-you-set",
		                       "displayName": "Sub-Sidebaritem"
		                   },
		                   {
		                       "id": "what-ever-you-set",
		                       "displayName": "Sub-Sidebaritem",
		                       "children": [
		                           {
		                               "id": "what-ever-you-set",
		                               "displayName": "Sub-Sub-Sidebaritem"
		                           },
		                           {
		                               "id": "what-ever-you-set",
		                               "displayName": "Sub-Sub-Sidebaritem"
		                           }
		                       ]
		                   }
		               ]
		           }
		       ]
		   }
		]'></sidebar-menu>
```

You can pass the sidebar structure via json into the element. The icon property contains the relative path to the images folder. The base path can be set via the **images-root** property.

## Styling
The component has a default style, which can be overwritten by setting the css variables, like seen in the code-snippet above.
