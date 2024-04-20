# Include
include .env

# Variables
APP_VERSION := $(shell cat version)

# Targets
run:
	cd website && npm run start
serve:
	cd website && npm run start

build:
	cd website && npx @11ty/eleventy --input=. --output=_site

docker-build:
	docker build -t $(DOCKER_USERNAME)/$(DOCKER_IMAGE):$(APP_VERSION) .

docker-push:
	docker push $(DOCKER_USERNAME)/$(DOCKER_IMAGE):${APP_VERSION}

update-patch:
	@echo "Updating patch version..."
	$(eval OLD_VERSION := $(shell cat version))
	@echo "OLD VERSION : ${OLD_VERSION}"
	$(eval NEW_VERSION := $(shell echo $(OLD_VERSION) | awk -F '.' '{$$3=$$3+1; print}' OFS='.'))
	@echo "NEW VERSION : ${NEW_VERSION}"
	@echo -n $(NEW_VERSION) > version

update-minor:
	@echo "Updating minor version..."
	$(eval OLD_VERSION := $(shell cat version))
	@echo "OLD VERSION : ${OLD_VERSION}"
	$(eval NEW_VERSION := $(shell echo $(OLD_VERSION) | awk -F '.' '{$$2=$$2+1; $$3=0; print}' OFS='.'))
	@echo "NEW VERSION : ${NEW_VERSION}"
	@echo -n $(NEW_VERSION) > version

update-major:
	@echo "Updating major version..."
	$(eval OLD_VERSION := $(shell cat version))
	@echo "OLD VERSION : ${OLD_VERSION}"
	$(eval NEW_VERSION := $(shell echo $(OLD_VERSION) | awk -F '.' '{$$1=$$1+1; $$2=0; $$3=0; print}' OFS='.'))
	@echo "NEW VERSION : ${NEW_VERSION}"
	@echo -n $(NEW_VERSION) > version

deploy: 
	docker push $(DOCKER_USERNAME)/$(DOCKER_IMAGE):${APP_VERSION}