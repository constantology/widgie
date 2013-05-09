!function() {
var config = {
	"compiled"  : true,
	"execute"   : function( cmp, method ) {
		return typeof cmp[method] == 'function'
			 ? cmp[method].apply( cmp, Array.coerce( arguments, 2 ) )
			 : '';
	},
	"prepare"   : function( cmp ) {
		return cmp.prepare( cmp.data ? cmp.data : null );
	},
	"sort"      : function( items, field ) { //schwartzian transform
		return items.values.map( function( item ) {
			return [item[field], item];
		} ).sort( function( a, b ) {
			return a[0] == b[0] ? 0 : a[0] < b[0] ? 1 : -1;
		} ).map( function( item ) {
			return item[1];
		} );
	},
	"toJSON"    : function( items ) {
		return items.valueOf();
	}
};
new Templ8( m8.copy( { id : 'widgie.box', sourceURL : 'tpl/box.html'  }, config ), '<{{ @.tagName }} class=\"{{ @.clsBase }} {{ @.clsDefault if @.clsDefault|exists }} {{ @.cls if @.cls|exists }}\"{% if this.focusable !== false %} tabindex=\"-1\"{% endif %}>',
'	<div class=\"{{ @.clsBase }}-ct\" data-ref=\"ct\"></div>',
'</{{ @.tagName }}>' );
new Templ8( m8.copy( { id : 'widgie.component', sourceURL : 'tpl/component.html'  }, config ), '<{{ @.tagName }} class=\"{{ @.clsBase }} {{ @.clsDefault if @.clsDefault|exists }} {{ @.cls if @.cls|exists }}\"{% if this.focusable !== false %} tabindex=\"-1\"{% endif %}><div class=\"{{ @.clsBase }}-ct\" data-ref=\"ct\">',
'	{{ @.html if @.html|type:\"string\" }}',
'	{% if @.tplContent|exists AND @.data|exists %}{{ @|prepare:@.data|parse:@.tplContent }}{% endif %}',
'</div></{{ @.tagName }}>' );
new Templ8( m8.copy( { id : 'widgie.field', sourceURL : 'tpl/field.html'  }, config ), '{% sub label %}',
'<label class=\"{{ clsBase }}-label\" data-ref=\"label\" for=\"{{ id }}-input\">{{ label }}</label>',
'{% endsub %}',
'{% sub placeholder %}',
'placeholder=\"{% if placeholder === \':label\' %}{{ label }}{% else %}{{ placeholder }}{% endif %}\"',
'{% endsub %}',
'<{{ @.tagName }} class=\"{{ @.clsBase }} {{ @.clsDefault if @.clsDefault|exists }} {{ @.cls if @.cls|exists }} {{ @.clsBase }}-{{ @.inputType }}\"{% if @.errorMsg %} data-error-msg=\"{{ @.errorMsg }}\"{% endif %} tabindex=\"-1\"><div class=\"{{ @.clsBase }}-ct\" data-ref=\"ct\"{% if @.toolTip %} data-tool-tip=\"{{ @.toolTip }}\"{% endif %}>',
'	{% if @.showLabel AND @.labelPosition !== \'after\' %}{{ @|parse:\"label\" }}{% endif %}',
'	<span class=\"{{ @.clsBase }}-input-ct {{ @.clsBase }}-input-{{ @.inputType }}-ct\">{% if @.inputType === \'text\' AND @.multiLine === true %}',
'		<textarea autocapitalize=\"off\" autocorrect=\"off\" class=\"{{ @.clsBase }}-input {{ @.clsBase }}-input-multiline {{ @.clsBase }}-input-{{ @.inputType }}\" data-ref=\"field\" id=\"{{ @.id }}-input\" name=\"{{ @.name }}\" {{ @|parse:\"placeholder\" if @.placeholder|type:\"string\" }}></textarea>',
'	{% else %}',
'		<input autocapitalize=\"off\" autocorrect=\"off\" class=\"{{ @.clsBase }}-input {{ @.clsBase }}-input-{{ @.inputType }}\" data-ref=\"field\" id=\"{{ @.id }}-input\" name=\"{{ @.name }}\" {{ @|parse:\"placeholder\" if @.placeholder|type:\"string\" }} type=\"{{ @._inputType }}\" value=\"{{ @.value if @.value|exists }}\" />',
'	{% endif %}</span>',
'	{% if @.showLabel AND @.labelPosition === \'after\' %}{{ @|parse:\"label\" }}{% endif %}',
'</div></{{ @.tagName }}>' );
}();