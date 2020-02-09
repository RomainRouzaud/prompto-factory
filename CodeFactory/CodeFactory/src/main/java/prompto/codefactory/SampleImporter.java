package prompto.codefactory;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.nio.file.FileSystemNotFoundException;
import java.nio.file.Paths;
import java.nio.file.spi.FileSystemProvider;
import java.time.OffsetDateTime;
import java.util.Collections;

import prompto.code.ICodeStore;
import prompto.code.ImmutableCodeStore;
import prompto.code.Module;
import prompto.code.ModuleStatus;
import prompto.code.ModuleType;
import prompto.code.TextResource;
import prompto.code.WebLibrary;
import prompto.intrinsic.PromptoVersion;
import prompto.utils.Logger;
import prompto.utils.StreamUtils;
import prompto.value.ImageValue;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class SampleImporter {

	static Logger logger = new Logger();

	Module module;
	URL imageResource;
	URL codeResource;
	URL nativeResource;
	URL stubResource;
	
	public SampleImporter(Module module, URL codeResource) {
		this.module = module;
		this.codeResource = codeResource;
	}
	
	public SampleImporter(String resourcePath) {
		this(Thread.currentThread().getContextClassLoader().getResource(resourcePath));
	}
	
	public SampleImporter(URL url) {
		try {
			JsonNode descriptor = readDescriptor(url);
			Module module = newModule(descriptor);
			populateModule(module, descriptor);
			populateResources(url, descriptor);
			// done
			this.module = module;
		} catch(Exception e) {
			e.printStackTrace(System.err);
		}
	}

	private void populateResources(URL url, JsonNode descriptor) throws MalformedURLException {
		if(descriptor.get("imageResource")!=null)
			this.imageResource = new URL(url, descriptor.get("imageResource").asText());
		if(descriptor.get("codeResource")!=null)
			this.codeResource = new URL(url, descriptor.get("codeResource").asText());
		if(descriptor.get("nativeResource")!=null)
			this.nativeResource = new URL(url, descriptor.get("nativeResource").asText());
		if(descriptor.get("stubResource")!=null)
			this.stubResource = new URL(url, descriptor.get("stubResource").asText());
	}

	private void populateModule(Module module, JsonNode descriptor) throws Exception {
		ModulePopulator populator = ModulePopulator.forType(module);
		populator.populate(module, descriptor);
	}
	
	

	private Module newModule(JsonNode descriptor) throws InstantiationException, IllegalAccessException {
		String typeName = descriptor.get("type").asText();
		ModuleType type = ModuleType.valueOf(typeName);
		return type.getModuleClass().newInstance();
	}

	private JsonNode readDescriptor(URL path) throws JsonProcessingException, IOException {
		URL json = new URL(path, "module.json");
		try(InputStream input = json.openStream()) {
			return new ObjectMapper().readTree(input);
		}
	}

	public boolean importModule(ICodeStore codeStore) throws Exception {
		Module existing = codeStore.fetchModule(module.getType(), module.getName(), module.getVersion());
		if(existing!=null)
			return false;
		logger.info(()->"Importing module: " + module.getName() + " - " + module.getVersion());
		if(imageResource!=null)
			module.setImage(ImageValue.fromURL(imageResource).getStorableData());
		codeStore.storeModule(module);	
		if(codeResource!=null)
			storeAssociatedCode(codeStore);
		if(module instanceof WebLibrary) {
			if(nativeResource!=null) 
				storeResource(codeStore, nativeResource);
			if(stubResource!=null) 
				storeResource(codeStore, stubResource);
		}
		return true;
	}

	private void storeAssociatedCode(ICodeStore codeStore) throws Exception {
		ImmutableCodeStore rcs = new ImmutableCodeStore(null, module.getType(), codeResource, module.getVersion());
		codeStore.storeDeclarations(rcs.getDeclarations(), rcs.getModuleDialect(), module.getVersion(), module.getDbId());
	}
	
	private void storeResource(ICodeStore codeStore, URL resourceUrl) throws Exception {
		initializeJarFileSystem(resourceUrl.toURI());
		String fileName = Paths.get(resourceUrl.toURI()).getFileName().toString();
		String fullName = module.getName().toLowerCase().replaceAll(" ", "-") + "/" + fileName;
		TextResource resource = new TextResource();
		resource.setMimeType("text/javascript");
		resource.setName(fullName);
		resource.setVersion(PromptoVersion.LATEST);
		resource.setLastModified(OffsetDateTime.now());
		resource.setBody(StreamUtils.readString(resourceUrl));
		codeStore.storeResource(resource, module.getDbId());
	}

	private void initializeJarFileSystem(URI uri) throws IOException {
		if("jar".equals(uri.getScheme())) {
		  for (FileSystemProvider provider: FileSystemProvider.installedProviders()) {
		        if (provider.getScheme().equalsIgnoreCase("jar")) {
		            try {
		                provider.getFileSystem(uri);
		            } catch (FileSystemNotFoundException e) {
		                // in this case we need to initialize it first:
		                provider.newFileSystem(uri, Collections.emptyMap());
		            }
		        }
		    }
		}
	}

}
