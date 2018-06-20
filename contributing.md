# CONTRIBUTING

## Testing your code

### Manual testing command contributions
If you are adding a command to `yvm` that utilizes node, you can test it by executing the following in your terminal:

```text
node yvm.js <your-command-here>
```

Upon completing your command you can test it through the `yvm` CLI by running the following in the terminal:

```text
make install
yvm <your-command-here>
```
