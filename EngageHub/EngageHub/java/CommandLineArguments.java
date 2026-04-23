public class CommandLineArguments {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("No values");
        } else {
            // Join the arguments using commas
            String joinedArgs = String.join(", ", args);
            System.out.println(joinedArgs);
        }
    }
}
