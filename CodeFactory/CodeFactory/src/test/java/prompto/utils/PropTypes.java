package prompto.utils;

import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import prompto.grammar.Annotation;
import prompto.literal.DictEntry;
import prompto.literal.DictEntryList;
import prompto.literal.DocEntryList;
import prompto.literal.DocumentLiteral;
import prompto.parser.OCleverParser;
import prompto.property.Property;
import prompto.utils.PropTypesConverter.PropTypesMap;

public class PropTypes {
	
	List<String> inherited;
	List<Property> properties;
	DictEntryList entries = null;
	
	private String toDocumentLiteral() {
		StringWriter entriesWriter = new StringWriter();
		entriesWriter.append("{\n\t");
		boolean first = true;
		for(Property prop : properties) {
			if(first)
				first = false;
			else
				entriesWriter.append(",\n\t");
			prop.toLiteral(entriesWriter);
		}
		entriesWriter.append("\n}");
		return entriesWriter.toString();
	}

	public DictEntryList toDictEntries(PropTypesMap propertyMap) {
		if(entries==null) {
			if(inherited==null || inherited.isEmpty()) {
				entries = localPropertiesToDictEntries();
			} else {
				Map<String, DictEntry> mergedMap = new HashMap<>();
				inherited.forEach(name->mergeWidgetEntries(name, propertyMap, mergedMap));
				mergeDictEntries(mergedMap, localPropertiesToDocumentLiteral().getEntries());
				DocEntryList merged = new DocEntryList();
				merged.addAll(mergedMap.values());
				entries = new DictEntryList(new DictEntry(null, new DocumentLiteral(merged)));
			}
		}
		return entries;
	}

	private void mergeWidgetEntries(String name, PropTypesMap propertyMap, Map<String, DictEntry> mergedMap) {
		int idx = name.lastIndexOf('.');
		if(idx>=0)
			name = name.substring(0, idx);
		if(propertyMap.containsKey(name)) {
			Annotation inherited = propertyMap.get(name).apply(propertyMap);
			Object types = inherited.getDefaultArgument();
			if(types instanceof DocumentLiteral)
				mergeDictEntries(mergedMap, ((DocumentLiteral)types).getEntries());
		}
		
	}
	
	private void mergeDictEntries(Map<String, DictEntry> mergedMap, List<DictEntry> toMerge) {
		toMerge.forEach(arg->{
			mergedMap.put(arg.getKey().toString(), arg);
		});
	}
	
	
	private DictEntryList localPropertiesToDictEntries() {
		DocumentLiteral value = localPropertiesToDocumentLiteral();
		return new DictEntryList(new DictEntry(null, value));
	}
	
	private DocumentLiteral localPropertiesToDocumentLiteral() {
		String document_literal = toDocumentLiteral();
		OCleverParser parser = new OCleverParser(document_literal);
		return parser.doParse(parser::document_literal);
	}

	
}
