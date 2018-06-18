command=$1

yvm_use() {
	version=$1
	echo "called yvm use with version $version"
}

if [ "$command" = "use" ]; then
	yvm_use $2
else
	node yvm.js $@
fi
